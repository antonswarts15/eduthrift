package za.co.thrift.eduthrift.service.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.config.PaymentConfig;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.PaymentTransaction;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.PaymentTransactionRepository;
import za.co.thrift.eduthrift.service.EmailService;
import za.co.thrift.eduthrift.service.FCMNotificationService;
import za.co.thrift.eduthrift.service.LedgerService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Central payment orchestrator — the single entry point for all payment-related
 * operations throughout the application.
 *
 * <h2>Responsibilities</h2>
 * <ul>
 *   <li>Select the appropriate {@link PaymentProvider} for an order.</li>
 *   <li>Initiate payments and record the opening audit event.</li>
 *   <li>Process normalized {@link PaymentEvent}s and advance the order lifecycle.</li>
 *   <li>Trigger seller payouts after escrow release.</li>
 *   <li>Enforce webhook idempotency via the {@code payment_transactions} table.</li>
 * </ul>
 *
 * <h2>Dependency design — no circular wiring</h2>
 * <p>This service does <em>not</em> depend on
 * {@link za.co.thrift.eduthrift.service.EscrowService}. The escrow hold
 * ({@code holdFunds}) is triggered by the webhook controller after
 * {@link #processWebhookEvent} returns {@code true}. The payout direction is
 * one-way: {@code EscrowService.releaseToSeller()} calls
 * {@link #payoutSeller(Order)} here. No cycle.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final Map<String, PaymentProvider> providersByName;
    private final PaymentConfig paymentConfig;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final FCMNotificationService fcmService;
    private final LedgerService ledgerService;
    private final EmailService emailService;

    public PaymentService(List<PaymentProvider> providers,
                          PaymentConfig paymentConfig,
                          OrderRepository orderRepository,
                          PaymentTransactionRepository transactionRepository,
                          FCMNotificationService fcmService,
                          LedgerService ledgerService,
                          EmailService emailService) {
        this.providersByName = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        Function.identity()
                ));
        this.paymentConfig        = paymentConfig;
        this.orderRepository      = orderRepository;
        this.transactionRepository = transactionRepository;
        this.fcmService           = fcmService;
        this.ledgerService        = ledgerService;
        this.emailService         = emailService;
        log.info("PaymentService initialized — registered providers: {}", providersByName.keySet());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Payment initiation
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initiate a payment for the given order using its assigned payment method.
     * Records a PAYMENT_INITIATED audit event regardless of success/failure.
     */
    @Transactional
    public PaymentResult initiatePayment(Order order) {
        PaymentProvider provider = resolveProvider(order.getPaymentMethod());
        PaymentResult result = provider.initiatePayment(order);

        recordTransaction(order,
                provider.getProviderName(),
                result.providerTransactionId(),
                PaymentEventType.PAYMENT_INITIATED.name(),
                order.getTotalAmount(),
                result.success() ? "INITIATED" : "FAILED",
                null);

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Webhook processing
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Process a normalized payment event received from a provider webhook.
     *
     * <p>The event must have already been verified and normalized by
     * {@link WebhookEventNormalizer} before being passed here.
     *
     * <p><strong>Idempotency:</strong> if the same
     * {@code provider + providerTransactionId + eventType} triple was already
     * processed, the call is a no-op and {@code false} is returned. The caller
     * should still return HTTP 200 to prevent the provider from retrying.
     *
     * @return {@code true} if the event was newly processed;
     *         {@code false} if it was a duplicate or the order was not found.
     */
    @Transactional
    public boolean processWebhookEvent(PaymentEvent event) {
        // Idempotency guard
        if (transactionRepository.existsByProviderAndProviderTransactionIdAndEventType(
                event.providerName(), event.providerTransactionId(), event.type().name())) {
            log.info("Duplicate webhook event ignored — provider={}, txId={}, type={}",
                    event.providerName(), event.providerTransactionId(), event.type());
            return false;
        }

        Order order = orderRepository.findByOrderNumber(event.orderNumber()).orElse(null);
        if (order == null) {
            log.warn("Webhook event {} for unknown order reference '{}' — acknowledged but not processed",
                    event.type(), event.orderNumber());
            return false;
        }

        // For a payment confirmation, verify the webhook amount matches what we charged.
        // Hash verification (done upstream) proves Ozow sent the data, but this guards
        // against edge cases where the amount could differ (partial payment, rounding, etc.).
        if (event.type() == PaymentEventType.PAYMENT_CONFIRMED
                && event.amount() != null
                && event.amount().compareTo(BigDecimal.ZERO) > 0
                && order.getTotalAmount().compareTo(event.amount()) != 0) {
            log.error("Amount mismatch for order {} — expected R{}, webhook reported R{} — rejecting event",
                    order.getOrderNumber(), order.getTotalAmount(), event.amount());
            recordTransaction(order, event.providerName(), event.providerTransactionId(),
                    "AMOUNT_MISMATCH", event.amount(), "REJECTED", event.rawPayload());
            return false;
        }

        // Audit first — then mutate state. Any mutation failure will roll back both.
        recordTransaction(order,
                event.providerName(),
                event.providerTransactionId(),
                event.type().name(),
                event.amount(),
                event.type().name(),
                event.rawPayload());

        switch (event.type()) {
            case PAYMENT_CONFIRMED -> handlePaymentConfirmed(order);
            case PAYMENT_FAILED    -> handlePaymentFailed(order);
            case PAYMENT_CANCELLED -> handlePaymentCancelled(order);
            case REFUND_COMPLETED  -> handleRefundCompleted(order);
            case PAYOUT_COMPLETED  -> handlePayoutCompleted(order);
            case PAYOUT_FAILED     -> handlePayoutFailed(order);
            default -> log.debug("Unhandled event type {} for order {} — recorded in audit log only",
                    event.type(), order.getOrderNumber());
        }

        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Payout
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initiate a seller payout for the given order.
     *
     * <p>Called by {@link za.co.thrift.eduthrift.service.EscrowService#releaseToSeller(Order)}
     * after escrow funds are released. Updates {@code payout_status} on the order:
     * <ul>
     *   <li>{@code COMPLETED} — provider accepted the transfer request.</li>
     *   <li>{@code MANUAL_REQUIRED} — provider does not support programmatic payouts
     *       (e.g. Ozow). Admin must manually EFT the seller.</li>
     *   <li>{@code FAILED} — provider returned an error. Admin should investigate.</li>
     * </ul>
     */
    @Transactional
    public void payoutSeller(Order order) {
        PaymentProvider provider = resolveProvider(order.getPaymentMethod());

        // Track the attempt before calling the provider — guards against double-payout
        // if the process crashes after the provider accepts the request but before we save
        order.setPayoutAttempts(order.getPayoutAttempts() + 1);
        order.setLastPayoutAttemptAt(LocalDateTime.now());
        orderRepository.save(order);

        PayoutResult result = provider.payoutSeller(order);

        if (result.requiresManualProcessing()) {
            order.setPayoutStatus(Order.PayoutStatus.MANUAL_REQUIRED);
            order.setPayoutFailureReason(result.errorMessage());
            orderRepository.save(order);
            emailService.sendPayoutStatusEmail(order);
            log.info("Order {} payout set to MANUAL_REQUIRED — provider {} does not support auto-payouts",
                    order.getOrderNumber(), provider.getProviderName());

        } else if (result.success()) {
            order.setPayoutStatus(Order.PayoutStatus.COMPLETED);
            order.setPayoutDate(LocalDateTime.now());
            order.setPayoutFailureReason(null);
            orderRepository.save(order);
            ledgerService.postPayout(order);
            emailService.sendPayoutStatusEmail(order);
            log.info("Payout completed for order {} via {} — ref: {}",
                    order.getOrderNumber(), provider.getProviderName(), result.providerReference());

        } else {
            order.setPayoutStatus(Order.PayoutStatus.FAILED);
            order.setPayoutFailureReason(result.errorMessage());
            orderRepository.save(order);
            emailService.sendPayoutStatusEmail(order);
            int remaining = 3 - order.getPayoutAttempts();
            if (remaining > 0) {
                log.warn("Payout failed for order {} via {} (attempt {}/3, {} retry/retries remaining): {}",
                        order.getOrderNumber(), provider.getProviderName(),
                        order.getPayoutAttempts(), remaining, result.errorMessage());
            } else {
                log.error("Payout EXHAUSTED for order {} via {} — all 3 attempts failed, admin intervention required: {}",
                        order.getOrderNumber(), provider.getProviderName(), result.errorMessage());
            }
        }

        recordTransaction(order,
                provider.getProviderName(),
                result.providerReference(),
                PaymentEventType.PAYOUT_INITIATED.name(),
                order.getSellerPayout(),
                order.getPayoutStatus().name(),
                null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event handlers (private — called by processWebhookEvent)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Payment funds confirmed received. The caller
     * ({@link za.co.thrift.eduthrift.controller.PaymentController}) is
     * responsible for calling {@code EscrowService.holdFunds(order)} after
     * this method returns — this method only updates payment status to avoid
     * duplicate field writes when holdFunds also sets CAPTURED.
     */
    private void handlePaymentConfirmed(Order order) {
        if (order.getPaymentStatus() == Order.PaymentStatus.CAPTURED) {
            log.info("Order {} already CAPTURED — skipping duplicate payment confirmed event",
                    order.getOrderNumber());
            return;
        }
        order.setPaymentStatus(Order.PaymentStatus.CAPTURED);
        orderRepository.save(order);
        log.info("Payment confirmed for order {} via {}", order.getOrderNumber(), order.getPaymentMethod());
    }

    private void handlePaymentFailed(Order order) {
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        fcmService.send(
                order.getBuyer().getFcmToken(),
                "Payment Failed",
                "Your payment for order " + order.getOrderNumber() + " could not be processed. Please try again."
        );
        emailService.sendPaymentFailedEmail(order);
        log.warn("Payment failed for order {}", order.getOrderNumber());
    }

    private void handlePaymentCancelled(Order order) {
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        emailService.sendOrderCancellationEmail(order, "Payment was cancelled");
        log.info("Payment cancelled for order {}", order.getOrderNumber());
    }

    private void handleRefundCompleted(Order order) {
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        order.setOrderStatus(Order.OrderStatus.REFUNDED);
        order.setEscrowStatus(Order.EscrowStatus.REFUNDED_TO_BUYER);
        orderRepository.save(order);
        emailService.sendRefundEmail(order);
        log.info("Refund completed (webhook confirmation) for order {}", order.getOrderNumber());
    }

    private void handlePayoutCompleted(Order order) {
        if (order.getPayoutStatus() == Order.PayoutStatus.COMPLETED) {
            return; // already recorded via payoutSeller()
        }
        order.setPayoutStatus(Order.PayoutStatus.COMPLETED);
        order.setPayoutDate(LocalDateTime.now());
        orderRepository.save(order);
        emailService.sendPayoutStatusEmail(order);
        log.info("Payout completed (webhook confirmation) for order {}", order.getOrderNumber());
    }

    private void handlePayoutFailed(Order order) {
        order.setPayoutStatus(Order.PayoutStatus.FAILED);
        orderRepository.save(order);
        emailService.sendPayoutStatusEmail(order);
        log.error("Payout failed (webhook notification) for order {}", order.getOrderNumber());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Provider resolution
    // ─────────────────────────────────────────────────────────────────────────

    private PaymentProvider resolveProvider(Order.PaymentMethod paymentMethod) {
        String name = (paymentMethod != null)
                ? paymentMethod.name().toUpperCase()
                : paymentConfig.getDefaultProvider().toUpperCase();

        PaymentProvider provider = providersByName.get(name);
        if (provider == null) {
            throw new IllegalStateException(
                    "No PaymentProvider registered for '" + name + "'. "
                            + "Registered providers: " + providersByName.keySet());
        }
        return provider;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Audit log
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Persist an audit record to the {@code payment_transactions} table.
     * Failures are non-fatal — they are logged but must never abort the payment flow.
     */
    private void recordTransaction(Order order,
                                    String provider,
                                    String providerTransactionId,
                                    String eventType,
                                    BigDecimal amount,
                                    String status,
                                    String rawPayload) {
        try {
            transactionRepository.save(
                    PaymentTransaction.of(order, provider, providerTransactionId,
                            eventType, amount, status, rawPayload));
        } catch (Exception e) {
            log.error("Failed to record payment transaction audit entry for order {} (non-fatal): {}",
                    order != null ? order.getOrderNumber() : "unknown", e.getMessage(), e);
        }
    }
}
