package za.co.thrift.eduthrift.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.service.EscrowService;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

/**
 * Receives delivery status webhooks from PUDO.
 *
 * When a buyer opens the locker and collects their item, PUDO posts a webhook here.
 * We call TradeSafe allocationAcceptDelivery which releases funds to the seller automatically.
 *
 * One-time setup (once PUDO approves your API access):
 *   1. Generate a random secret and set PUDO_WEBHOOK_SECRET in your .env
 *   2. Register https://api.eduthrift.co.za/webhooks/pudo in the PUDO developer portal
 *      as the webhook URL, using the same secret for HMAC-SHA256 request signing
 */
@RestController
@RequestMapping("/webhooks")
public class PudoWebhookController {

    @Value("${pudo.webhook.secret:}")
    private String webhookSecret;

    private final OrderRepository orderRepository;
    private final EscrowService escrowService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PudoWebhookController(OrderRepository orderRepository, EscrowService escrowService) {
        this.orderRepository = orderRepository;
        this.escrowService = escrowService;
    }

    @PostMapping("/pudo")
    public ResponseEntity<?> handlePudoWebhook(
            @RequestHeader(value = "X-Pudo-Signature", required = false) String signature,
            HttpServletRequest request) throws IOException {

        // Read raw body once so we can both verify the signature and parse the JSON
        byte[] bodyBytes = request.getInputStream().readAllBytes();
        String rawBody = new String(bodyBytes, StandardCharsets.UTF_8);

        // Verify HMAC-SHA256 signature when a secret is configured
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            if (!isSignatureValid(rawBody, signature)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid signature"));
            }
        }

        Map<String, Object> payload;
        try {
            payload = objectMapper.readValue(rawBody, new TypeReference<>() {});
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid JSON payload"));
        }

        // PUDO may nest data differently across API versions — probe both top-level and nested
        String trackingNumber = extractField(payload, "waybill_number", "tracking_number", "parcel_number", "reference");
        if (trackingNumber == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No tracking number in payload"));
        }

        String status = extractField(payload, "status", "event", "event_type", "parcel_status");
        if (status == null) {
            return ResponseEntity.ok(Map.of("received", true, "action", "ignored_no_status"));
        }

        Optional<Order> orderOpt = orderRepository.findByTrackingNumber(trackingNumber);
        if (orderOpt.isEmpty()) {
            // Unknown tracking number — acknowledge so PUDO doesn't keep retrying
            return ResponseEntity.ok(Map.of("received", true, "action", "order_not_found"));
        }

        Order order = orderOpt.get();

        return switch (status.toUpperCase()) {
            case "COLLECTED", "DELIVERED", "PARCEL_COLLECTED", "COLLECTION_COMPLETED" -> {
                // Buyer collected from locker — run the full escrow release state machine
                try {
                    escrowService.confirmDelivery(order.getOrderNumber());
                } catch (Exception e) {
                    // Delivery may already be confirmed (idempotent re-delivery from PUDO)
                    yield ResponseEntity.ok(Map.of(
                        "received", true,
                        "action", "delivery_already_processed",
                        "orderNumber", order.getOrderNumber()
                    ));
                }
                yield ResponseEntity.ok(Map.of(
                    "received", true,
                    "action", "funds_released",
                    "orderNumber", order.getOrderNumber()
                ));
            }
            case "AT_LOCKER", "READY_FOR_COLLECTION" -> {
                // Item arrived at locker — reset the 72h buyer confirmation window from now,
                // so the timer reflects when the buyer can actually collect, not when they paid.
                order.setOrderStatus(Order.OrderStatus.DELIVERED);
                order.setPayoutScheduledAt(LocalDateTime.now().plusHours(72));
                orderRepository.save(order);
                yield ResponseEntity.ok(Map.of("received", true, "action", "timer_reset_awaiting_collection"));
            }
            case "IN_TRANSIT", "PARCEL_RECEIVED" -> {
                // Item en route — update status, leave timer unchanged
                order.setOrderStatus(Order.OrderStatus.SHIPPED);
                orderRepository.save(order);
                yield ResponseEntity.ok(Map.of("received", true, "action", "status_updated"));
            }
            default ->
                // Unrecognised event — acknowledge without taking action
                ResponseEntity.ok(Map.of("received", true, "action", "ignored", "status", status));
        };
    }

    /**
     * Tries each key in order on both the top-level payload and a nested "data" object.
     */
    @SuppressWarnings("unchecked")
    private String extractField(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object val = payload.get(key);
            if (val instanceof String s && !s.isBlank()) return s;
        }
        Object nested = payload.get("data");
        if (nested instanceof Map<?, ?> dataMap) {
            for (String key : keys) {
                Object val = ((Map<String, Object>) dataMap).get(key);
                if (val instanceof String s && !s.isBlank()) return s;
            }
        }
        return null;
    }

    /**
     * Verifies the HMAC-SHA256 signature sent in the X-Pudo-Signature header.
     * Expected format: "sha256=<hex-digest>"
     */
    private boolean isSignatureValid(String body, String receivedSignature) {
        if (receivedSignature == null || receivedSignature.isBlank()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + HexFormat.of().formatHex(hash);
            return constantTimeEquals(expected, receivedSignature);
        } catch (Exception e) {
            return false;
        }
    }

    /** Constant-time string comparison to prevent timing-based signature forgery. */
    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
