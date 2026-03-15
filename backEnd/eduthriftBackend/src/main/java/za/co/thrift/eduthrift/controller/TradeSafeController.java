package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.TradeSafeService;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class TradeSafeController {

    private final TradeSafeService tradeSafeService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public TradeSafeController(TradeSafeService tradeSafeService,
                                OrderRepository orderRepository,
                                UserRepository userRepository) {
        this.tradeSafeService = tradeSafeService;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Called by TradeSafe when a transaction state changes (e.g. funds received, delivery accepted).
     * This endpoint must be publicly accessible — TradeSafe calls it from their servers.
     * Registered in TradeSafe developer portal as: https://www.eduthrift.co.za/tradesafe/callback
     */
    @PostMapping("/tradesafe/callback")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, Object> payload) {
        try {
            String transactionId = (String) payload.get("id");
            String state = (String) payload.get("state");
            String reference = (String) payload.get("reference");

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
                }
                case "DELIVERY_ACCEPTED" -> {
                    order.setOrderStatus(Order.OrderStatus.DELIVERED);
                    order.setDeliveryConfirmed(true);
                }
                case "COMPLETED" -> {
                    order.setOrderStatus(Order.OrderStatus.COMPLETED);
                    order.setEscrowStatus(Order.EscrowStatus.RELEASED_TO_SELLER);
                    order.setPayoutStatus(Order.PayoutStatus.COMPLETED);
                }
                case "CANCELLED", "DECLINED" -> {
                    order.setPaymentStatus(Order.PaymentStatus.FAILED);
                    order.setOrderStatus(Order.OrderStatus.CANCELLED);
                }
                case "REFUNDED" -> {
                    order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
                    order.setOrderStatus(Order.OrderStatus.REFUNDED);
                    order.setEscrowStatus(Order.EscrowStatus.REFUNDED_TO_BUYER);
                }
                default -> { /* Unknown state — log and ignore */ }
            }

            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("received", true));

        } catch (Exception e) {
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
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transactionId", transaction.transactionId(),
                    "depositUrl", transaction.depositUrl()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create TradeSafe transaction"));
        }
    }
}
