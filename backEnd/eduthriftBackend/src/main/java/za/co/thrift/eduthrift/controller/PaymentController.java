package za.co.thrift.eduthrift.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.service.EscrowService;
import za.co.thrift.eduthrift.service.WebhookLogService;
import za.co.thrift.eduthrift.service.payment.*;

import java.util.Map;
import java.util.Optional;

/**
 * Payment initiation and webhook receiver for all payment providers.
 *
 * <p>Provider-specific endpoints ({@code /paystack/initiate}, {@code /ozow/webhook}, …)
 * are preserved so existing frontend calls and provider webhook configurations remain
 * unchanged. All logic is now routed through the provider-agnostic
 * {@link PaymentService} and {@link WebhookEventNormalizer}.
 *
 * <h2>Adding a new provider</h2>
 * <ol>
 *   <li>Add a corresponding {@code initiateX()} and {@code xWebhook()} method below.</li>
 *   <li>Register the provider's webhook URL in the provider dashboard pointing to
 *       {@code https://api.eduthrift.co.za/payments/<provider>/webhook}.</li>
 *   <li>No changes needed in {@link PaymentService} or {@link EscrowService}.</li>
 * </ol>
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final WebhookEventNormalizer webhookNormalizer;
    private final WebhookLogService webhookLogService;
    private final OrderRepository orderRepository;
    private final EscrowService escrowService;

    public PaymentController(PaymentService paymentService,
                              WebhookEventNormalizer webhookNormalizer,
                              WebhookLogService webhookLogService,
                              OrderRepository orderRepository,
                              EscrowService escrowService) {
        this.paymentService    = paymentService;
        this.webhookNormalizer = webhookNormalizer;
        this.webhookLogService = webhookLogService;
        this.orderRepository   = orderRepository;
        this.escrowService     = escrowService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYSTACK — Card payments
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Buyer calls this to get a Paystack-hosted payment URL for card payment.
     * Returns: {@code { success: true, authorizationUrl: "https://..." }}
     */
    @PostMapping("/paystack/initiate")
    public ResponseEntity<?> initiatePaystack(@RequestBody Map<String, String> request,
                                               Authentication authentication) {
        return initiatePayment(request, authentication, Order.PaymentMethod.PAYSTACK, "authorizationUrl");
    }

    /**
     * Paystack calls this endpoint after a card payment is processed.
     * Security: HMAC-SHA512 of raw body verified against {@code x-paystack-signature} header.
     */
    @PostMapping("/paystack/webhook")
    public ResponseEntity<?> paystackWebhook(
            @RequestBody String rawBody,
            @RequestHeader Map<String, String> headers) {
        return handleWebhook("PAYSTACK", "/payments/paystack/webhook", WebhookRequest.ofJson(rawBody, headers));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OZOW — Instant EFT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Buyer calls this to get an Ozow EFT payment URL.
     * Returns: {@code { success: true, paymentUrl: "https://..." }}
     */
    @PostMapping("/ozow/initiate")
    public ResponseEntity<?> initiateOzow(@RequestBody Map<String, String> request,
                                           Authentication authentication) {
        return initiatePayment(request, authentication, Order.PaymentMethod.OZOW, "paymentUrl");
    }

    /**
     * Ozow calls this endpoint after an EFT is processed (Complete / Cancelled / Error).
     * Security: SHA-512 of concatenated parameters + private key in the {@code Hash} field.
     */
    @PostMapping("/ozow/webhook")
    public ResponseEntity<?> ozowWebhook(@RequestParam Map<String, String> params,
                                          @RequestHeader Map<String, String> headers) {
        return handleWebhook("OZOW", "/payments/ozow/webhook", WebhookRequest.ofForm(params, headers));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PEACH PAYMENTS — Stub (activated when payment.providers.peach.enabled=true)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns: {@code { success: true, redirectUrl: "https://..." }}
     */
    @PostMapping("/peach/initiate")
    public ResponseEntity<?> initiatePeach(@RequestBody Map<String, String> request,
                                            Authentication authentication) {
        return initiatePayment(request, authentication, Order.PaymentMethod.PEACH, "redirectUrl");
    }

    @PostMapping("/peach/webhook")
    public ResponseEntity<?> peachWebhook(@RequestBody String rawBody,
                                           @RequestHeader Map<String, String> headers) {
        return handleWebhook("PEACH", "/payments/peach/webhook", WebhookRequest.ofJson(rawBody, headers));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STITCH — Stub (activated when payment.providers.stitch.enabled=true)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns: {@code { success: true, redirectUrl: "https://..." }}
     */
    @PostMapping("/stitch/initiate")
    public ResponseEntity<?> initiateStitch(@RequestBody Map<String, String> request,
                                             Authentication authentication) {
        return initiatePayment(request, authentication, Order.PaymentMethod.STITCH, "redirectUrl");
    }

    @PostMapping("/stitch/webhook")
    public ResponseEntity<?> stitchWebhook(@RequestBody String rawBody,
                                            @RequestHeader Map<String, String> headers) {
        return handleWebhook("STITCH", "/payments/stitch/webhook", WebhookRequest.ofJson(rawBody, headers));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Shared helpers — all provider endpoints converge here
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Shared payment initiation flow:
     * 1. Authenticate + validate request
     * 2. Set payment method on order
     * 3. Delegate to PaymentService.initiatePayment()
     * 4. Return provider redirect URL under the given JSON key
     */
    private ResponseEntity<?> initiatePayment(Map<String, String> request,
                                               Authentication authentication,
                                               Order.PaymentMethod method,
                                               String urlResponseKey) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String orderNumber = request.get("orderNumber");
        if (orderNumber == null || orderNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderNumber is required"));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found"));
        }

        Order order = orderOpt.get();

        if (!order.getBuyer().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your order"));
        }
        if (order.getOrderStatus() != Order.OrderStatus.PENDING_PAYMENT) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order is not awaiting payment"));
        }

        order.setPaymentMethod(method);
        orderRepository.save(order);

        PaymentResult result = paymentService.initiatePayment(order);
        if (!result.success()) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not initiate payment"));
        }
        return ResponseEntity.ok(Map.of("success", true, urlResponseKey, result.redirectUrl()));
    }

    /**
     * Shared webhook processing flow:
     * 1. Log raw request to webhook_logs BEFORE verification (captures all traffic)
     * 2. Verify signature via WebhookEventNormalizer (throws on bad signature)
     * 3. Process the normalized event via PaymentService (idempotency enforced)
     * 4. If PAYMENT_CONFIRMED: trigger EscrowService.holdFunds()
     * 5. Update webhook log with outcome
     * 6. Always return 200 once signature is verified — prevents provider retries on 5xx
     */
    private ResponseEntity<?> handleWebhook(String providerName, String endpointPath,
                                             WebhookRequest webhookRequest) {
        // Step 1: log the raw request unconditionally — even forged requests are captured
        Long logId = webhookLogService.logIncoming(providerName, endpointPath, webhookRequest);

        try {
            // Step 2: verify signature and normalize payload
            PaymentEvent event = webhookNormalizer.normalize(providerName, webhookRequest);
            webhookLogService.markVerified(logId, event.orderNumber());

            // Step 3: process (idempotency enforced inside)
            boolean processed = paymentService.processWebhookEvent(event);

            // Step 4: hold funds if this is a fresh payment confirmation
            if (processed && event.type() == PaymentEventType.PAYMENT_CONFIRMED) {
                orderRepository.findByOrderNumber(event.orderNumber())
                        .ifPresent(escrowService::holdFunds);
            }

            webhookLogService.markProcessed(logId);
            return ResponseEntity.ok().build();

        } catch (WebhookVerificationException e) {
            log.warn("{} webhook rejected — signature/hash invalid: {}", providerName, e.getMessage());
            webhookLogService.markFailed(logId, "Signature invalid: " + e.getMessage());
            return ResponseEntity.status(401).build();

        } catch (Exception e) {
            log.error("{} webhook processing error: {}", providerName, e.getMessage(), e);
            webhookLogService.markFailed(logId, "Processing error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
