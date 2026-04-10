package za.co.thrift.eduthrift.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.FCMNotificationService;
import za.co.thrift.eduthrift.service.OrderExpiryService;
import za.co.thrift.eduthrift.service.TCGShippingService;
import za.co.thrift.eduthrift.service.TradeSafeService;

import java.util.Map;
import java.util.Optional;

@RestController
public class TradeSafeController {

    private static final Logger log = LoggerFactory.getLogger(TradeSafeController.class);

    private final TradeSafeService tradeSafeService;
    private final TCGShippingService tcgShippingService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FCMNotificationService fcmNotificationService;
    private final OrderExpiryService orderExpiryService;

    public TradeSafeController(TradeSafeService tradeSafeService,
                                TCGShippingService tcgShippingService,
                                OrderRepository orderRepository,
                                UserRepository userRepository,
                                FCMNotificationService fcmNotificationService,
                                OrderExpiryService orderExpiryService) {
        this.tradeSafeService = tradeSafeService;
        this.tcgShippingService = tcgShippingService;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.fcmNotificationService = fcmNotificationService;
        this.orderExpiryService = orderExpiryService;
    }

    /**
     * Called by TradeSafe when a transaction state changes (e.g. funds received, delivery accepted).
     * This endpoint must be publicly accessible — TradeSafe calls it from their servers.
     * Registered in TradeSafe developer portal as: https://www.eduthrift.co.za/tradesafe/callback
     */
    @PostMapping("/tradesafe/callback")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, Object> payload) {
        try {
            // TradeSafe wraps the transaction data under a "data" key:
            // { "url": "...", "data": { "id": "...", "state": "...", "reference": "..." } }
            @SuppressWarnings("unchecked")
            Map<String, Object> data = payload.get("data") instanceof Map
                    ? (Map<String, Object>) payload.get("data")
                    : payload; // fall back to top-level for forward-compatibility

            String transactionId = (String) data.get("id");
            String state = (String) data.get("state");
            String reference = (String) data.get("reference");

            if (transactionId == null || state == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing id or state"));
            }

            // Look up order by TradeSafe transaction ID first, then fall back to reference
            Optional<Order> orderOpt = orderRepository.findByTradeSafeTransactionId(transactionId);
            if (orderOpt.isEmpty() && reference != null) {
                orderOpt = orderRepository.findByOrderNumber(reference);
            }

            if (orderOpt.isEmpty()) {
                // Unknown transaction — acknowledge to prevent retries
                return ResponseEntity.ok(Map.of("received", true));
            }

            Order order = orderOpt.get();

            switch (state) {
                case "FUNDS_RECEIVED" -> {
                    order.setPaymentStatus(Order.PaymentStatus.CAPTURED);
                    order.setOrderStatus(Order.OrderStatus.PAYMENT_CONFIRMED);
                    order.setEscrowStatus(Order.EscrowStatus.HELD);
                    fcmNotificationService.send(
                            order.getBuyer().getFcmToken(),
                            "Payment Received",
                            "Your payment for order " + order.getOrderNumber() + " is held in escrow. The seller will ship your item shortly."
                    );

                    // Create TCG shipment now that funds are secured in escrow
                    String trackingRef = null;
                    if (order.getDeliveryLockerId() != null && order.getServiceLevelCode() != null) {
                        try {
                            Map<String, Object> shipment = tcgShippingService.createShipment(
                                    order, order.getSeller(), order.getBuyer());
                            Object tRef = shipment.get("short_tracking_reference");
                            if (tRef == null) tRef = shipment.get("tracking_reference");
                            if (tRef != null) {
                                trackingRef = tRef.toString();
                                order.setTrackingNumber(trackingRef);
                            }
                            Object shipmentId = shipment.get("id");
                            if (shipmentId != null) {
                                order.setTcgShipmentId(shipmentId.toString());
                            }
                            if (order.getTradeSafeAllocationId() != null) {
                                try {
                                    tradeSafeService.startDelivery(order.getTradeSafeAllocationId());
                                } catch (Exception ignored) {}
                            }
                        } catch (Exception ignored) {}
                    }

                    // Notify seller with Pudo drop-off instructions
                    String sellerMsg = "Funds for order " + order.getOrderNumber()
                            + " are secured in escrow. Please drop off the item at your nearest Pudo locker.";
                    if (trackingRef != null) {
                        sellerMsg += " Waybill/tracking: " + trackingRef
                                + ". The buyer's locker is: " + (order.getPickupPoint() != null ? order.getPickupPoint() : "see order details") + ".";
                    } else {
                        sellerMsg += " Open your orders in the app for the waybill and drop-off instructions.";
                    }
                    fcmNotificationService.send(
                            order.getSeller().getFcmToken(),
                            "Action Required: Ship Your Item",
                            sellerMsg
                    );
                }
                case "DELIVERY_ACCEPTED" -> {
                    order.setOrderStatus(Order.OrderStatus.DELIVERED);
                    order.setDeliveryConfirmed(true);
                }
                case "COMPLETED" -> {
                    order.setOrderStatus(Order.OrderStatus.COMPLETED);
                    order.setEscrowStatus(Order.EscrowStatus.RELEASED_TO_SELLER);
                    order.setPayoutStatus(Order.PayoutStatus.COMPLETED);
                    fcmNotificationService.send(
                            order.getSeller().getFcmToken(),
                            "Payment Released",
                            "Funds for order " + order.getOrderNumber() + " have been released to your account."
                    );
                }
                case "CANCELLED", "DECLINED" -> {
                    orderExpiryService.cancelOrderAndRestoreItem(order, "Payment was cancelled or declined via TradeSafe");
                }
                case "REFUNDED" -> {
                    order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
                    order.setOrderStatus(Order.OrderStatus.REFUNDED);
                    order.setEscrowStatus(Order.EscrowStatus.REFUNDED_TO_BUYER);
                    fcmNotificationService.send(
                            order.getBuyer().getFcmToken(),
                            "Refund Processed",
                            "Your refund for order " + order.getOrderNumber() + " has been processed."
                    );
                }
                default -> { /* Unknown state — log and ignore */ }
            }

            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("received", true));

        } catch (Exception e) {
            log.error("TradeSafe callback processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Callback processing failed"));
        }
    }

    /**
     * Creates a TradeSafe escrow transaction for an existing backend order.
     * Returns the deposit URL where the buyer funds the escrow.
     */
    @PostMapping("/payments/tradesafe/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, String> request,
                                              Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String orderNumber = request.get("orderNumber");
        if (orderNumber == null || orderNumber.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderNumber is required"));
        }

        String email = authentication.getName();
        Optional<User> buyerOpt = userRepository.findByEmail(email);
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found"));
        }

        Order order = orderOpt.get();
        User buyer = buyerOpt.get();
        User seller = order.getSeller();

        if (!order.getBuyer().getEmail().equals(email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your order"));
        }

        try {
            String buyerToken = tradeSafeService.createOrGetUserToken(buyer);
            String sellerToken = tradeSafeService.createOrGetUserToken(seller);

            TradeSafeService.TradeSafeTransaction transaction =
                    tradeSafeService.createTransaction(order, buyerToken, sellerToken);

            order.setTradeSafeTransactionId(transaction.transactionId());
            order.setTradeSafeAllocationId(transaction.allocationId());
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transactionId", transaction.transactionId(),
                    "depositUrl", transaction.depositUrl()
            ));

        } catch (Exception e) {
            log.error("TradeSafe payment initiation failed for order {}: {}", request.get("orderNumber"), e.getMessage(), e);
            String cause = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create TradeSafe transaction",
                "detail", cause != null ? cause : "unknown"
            ));
        }
    }
}
