package za.co.thrift.eduthrift.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.service.TradeSafeService;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

/**
 * Receives delivery status webhooks from ShipLogic (TCG/CourierGuy).
 *
 * When a courier delivers a large item to the buyer's address, ShipLogic posts a tracking
 * event here. On delivery confirmation we call TradeSafe allocationAcceptDelivery to release
 * funds to the seller — mirroring what PudoWebhookController does for locker orders.
 *
 * One-time setup (ShipLogic developer portal):
 *   1. Generate a random secret and set SHIPLOGIC_WEBHOOK_SECRET in your .env
 *   2. Register https://api.eduthrift.co.za/webhooks/shiplogic as the webhook URL
 */
@RestController
@RequestMapping("/webhooks")
public class ShipLogicWebhookController {

    @Value("${shiplogic.webhook.secret:}")
    private String webhookSecret;

    private final OrderRepository orderRepository;
    private final TradeSafeService tradeSafeService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ShipLogicWebhookController(OrderRepository orderRepository, TradeSafeService tradeSafeService) {
        this.orderRepository = orderRepository;
        this.tradeSafeService = tradeSafeService;
    }

    @PostMapping("/shiplogic")
    public ResponseEntity<?> handleShipLogicWebhook(
            @RequestHeader(value = "X-ShipLogic-Signature", required = false) String signature,
            HttpServletRequest request) throws IOException {

        byte[] bodyBytes = request.getInputStream().readAllBytes();
        String rawBody = new String(bodyBytes, StandardCharsets.UTF_8);

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

        // ShipLogic webhook events include the shipment ID and a status/event field
        String shipmentId = extractField(payload, "id", "shipment_id");
        String trackingRef = extractField(payload, "short_tracking_reference", "tracking_reference", "customer_reference");
        String status = extractField(payload, "status", "event", "event_type");

        if (status == null) {
            return ResponseEntity.ok(Map.of("received", true, "action", "ignored_no_status"));
        }

        // Locate the order by TCG shipment ID first, then by tracking number or order number
        Optional<Order> orderOpt = Optional.empty();
        if (shipmentId != null) {
            orderOpt = orderRepository.findByTcgShipmentId(shipmentId);
        }
        if (orderOpt.isEmpty() && trackingRef != null) {
            orderOpt = orderRepository.findByTrackingNumber(trackingRef);
            if (orderOpt.isEmpty()) {
                orderOpt = orderRepository.findByOrderNumber(trackingRef);
            }
        }

        if (orderOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("received", true, "action", "order_not_found"));
        }

        Order order = orderOpt.get();

        return switch (status.toUpperCase()) {
            case "DELIVERED", "DELIVERY_CONFIRMED", "PARCEL_DELIVERED" -> {
                order.setOrderStatus(Order.OrderStatus.DELIVERED);
                order.setDeliveryConfirmed(true);
                orderRepository.save(order);

                if (order.getTradeSafeAllocationId() != null) {
                    try {
                        tradeSafeService.acceptDelivery(order.getTradeSafeAllocationId());
                    } catch (Exception e) {
                        // Order marked delivered locally but TradeSafe call failed.
                        // Admin should manually accept delivery in TradeSafe portal
                        // for transaction: order.getTradeSafeTransactionId()
                        yield ResponseEntity.ok(Map.of(
                            "received", true,
                            "action", "delivery_marked_tradesafe_call_failed",
                            "orderNumber", order.getOrderNumber()
                        ));
                    }
                }

                yield ResponseEntity.ok(Map.of(
                    "received", true,
                    "action", "funds_released",
                    "orderNumber", order.getOrderNumber()
                ));
            }
            case "IN_TRANSIT", "OUT_FOR_DELIVERY", "COLLECTED_FROM_SENDER" -> {
                order.setOrderStatus(Order.OrderStatus.SHIPPED);
                orderRepository.save(order);
                yield ResponseEntity.ok(Map.of("received", true, "action", "status_updated", "status", status));
            }
            default ->
                ResponseEntity.ok(Map.of("received", true, "action", "ignored", "status", status));
        };
    }

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

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
