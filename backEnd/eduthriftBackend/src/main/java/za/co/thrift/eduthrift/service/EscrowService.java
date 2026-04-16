package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.service.payment.PaymentService;
import za.co.thrift.eduthrift.service.LedgerService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Manages the escrow lifecycle for Eduthrift orders.
 *
 * <p>Escrow state machine:
 * <pre>
 *   PENDING  ──holdFunds()──────────► HELD
 *   HELD     ──releaseToSeller()───► RELEASED_TO_SELLER
 *   HELD     ──refundToBuyer()─────► REFUNDED_TO_BUYER
 * </pre>
 *
 * <p>Payout is delegated to {@link PaymentService#payoutSeller(Order)}, which
 * routes to the correct provider adapter. This service has no direct dependency
 * on any specific payment provider (Paystack, Ozow, etc.).
 *
 * <p><strong>Dependency note:</strong> EscrowService → PaymentService (one-way).
 * PaymentService does NOT depend on EscrowService. No circular dependency.
 */
@Service
public class EscrowService {

    private static final Logger log = LoggerFactory.getLogger(EscrowService.class);

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final LedgerService ledgerService;

    public EscrowService(OrderRepository orderRepository,
                          PaymentService paymentService,
                          LedgerService ledgerService) {
        this.orderRepository = orderRepository;
        this.paymentService  = paymentService;
        this.ledgerService   = ledgerService;
    }

    /**
     * Place funds in escrow after payment is confirmed.
     *
     * Called by the webhook controller after a PAYMENT_CONFIRMED event is processed.
     * Sets a 72-hour auto-release timer as a safety net for non-responsive buyers.
     */
    @Transactional
    public void holdFunds(Order order) {
        order.setEscrowStatus(Order.EscrowStatus.HELD);
        order.setPaymentStatus(Order.PaymentStatus.CAPTURED);
        order.setOrderStatus(Order.OrderStatus.PAYMENT_CONFIRMED);
        order.setPayoutScheduledAt(LocalDateTime.now().plusHours(72));
        orderRepository.save(order);
        ledgerService.postPaymentReceived(order);
        log.info("Funds held for order {} via {}", order.getOrderNumber(), order.getPaymentMethod());
    }

    /**
     * Confirm delivery and immediately trigger escrow release to the seller.
     *
     * Called either by the buyer via {@code POST /orders/{orderNumber}/confirm-delivery},
     * or by a shipping provider webhook (PUDO, ShipLogic) confirming physical delivery.
     */
    @Transactional
    public void confirmDelivery(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        order.setDeliveryConfirmed(true);
        order.setDeliveryConfirmedDate(LocalDateTime.now());
        order.setOrderStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(order);

        releaseToSeller(order);
    }

    /**
     * Release escrow funds to the seller.
     *
     * Requires escrow to be in HELD state. The actual bank transfer is delegated to
     * {@link PaymentService#payoutSeller(Order)}, which selects the correct provider
     * and updates {@code payout_status} to one of:
     * <ul>
     *   <li>{@code COMPLETED} — transfer accepted by provider (e.g. Paystack)</li>
     *   <li>{@code MANUAL_REQUIRED} — provider does not support auto-payouts (e.g. Ozow)</li>
     *   <li>{@code FAILED} — provider returned an error; admin intervention needed</li>
     * </ul>
     */
    @Transactional
    public void releaseToSeller(Order order) {
        if (order.getEscrowStatus() != Order.EscrowStatus.HELD) {
            throw new RuntimeException(
                    "Cannot release — escrow is not HELD for order: " + order.getOrderNumber()
                            + " (current state: " + order.getEscrowStatus() + ")");
        }

        order.setEscrowStatus(Order.EscrowStatus.RELEASED_TO_SELLER);
        order.setOrderStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);
        ledgerService.postEscrowRelease(order);

        // Provider-agnostic payout — PaymentService routes to the correct adapter
        paymentService.payoutSeller(order);
    }

    /**
     * Mark order for refund to buyer.
     *
     * Updates internal state only. The actual payment reversal is either triggered
     * by the provider (REFUND_COMPLETED webhook event handled by PaymentService)
     * or manually by an admin.
     */
    @Transactional
    public void refundToBuyer(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        order.setEscrowStatus(Order.EscrowStatus.REFUNDED_TO_BUYER);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        order.setOrderStatus(Order.OrderStatus.REFUNDED);
        order.setPayoutStatus(Order.PayoutStatus.FAILED);
        orderRepository.save(order);
        ledgerService.postRefund(order);
        log.info("Refund state set for order {} (payment method: {})",
                order.getOrderNumber(), order.getPaymentMethod());
    }

    /**
     * Scheduled safety net: auto-release escrow after the 72-hour hold window.
     *
     * Runs every hour. Handles buyers who collected from a PUDO locker without
     * opening the app to confirm delivery.
     */
    @Scheduled(fixedRate = 3_600_000)
    public void processExpiredHolds() {
        List<Order> expired = orderRepository.findByOrderStatusAndPayoutScheduledAtBefore(
                Order.OrderStatus.PAYMENT_CONFIRMED,
                LocalDateTime.now()
        );

        if (expired.isEmpty()) return;
        log.info("Auto-releasing {} orders with expired 72h escrow hold", expired.size());

        for (Order order : expired) {
            try {
                log.info("Auto-releasing order {} (72h hold expired)", order.getOrderNumber());
                order.setDeliveryConfirmed(true);
                order.setDeliveryConfirmedDate(LocalDateTime.now());
                order.setOrderStatus(Order.OrderStatus.DELIVERED);
                orderRepository.save(order);
                releaseToSeller(order);
            } catch (Exception e) {
                log.error("Auto-release failed for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            }
        }
    }
}
