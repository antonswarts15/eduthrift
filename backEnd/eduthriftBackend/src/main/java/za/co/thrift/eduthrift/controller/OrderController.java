package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.ItemRepository;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.EscrowService;
import za.co.thrift.eduthrift.service.EmailService;
import za.co.thrift.eduthrift.service.FCMNotificationService;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final EscrowService escrowService;
    private final FCMNotificationService fcmNotificationService;
    private final EmailService emailService;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository,
                           ItemRepository itemRepository, EscrowService escrowService,
                           FCMNotificationService fcmNotificationService,
                           EmailService emailService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.escrowService = escrowService;
        this.fcmNotificationService = fcmNotificationService;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> buyerOpt = userRepository.findByEmail(email);
        if (buyerOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        // Support both single itemId and bundle itemIds
        List<Long> itemIds = new ArrayList<>();
        if (request.itemIds != null && !request.itemIds.isEmpty()) {
            itemIds.addAll(request.itemIds);
        } else if (request.itemId != null) {
            itemIds.add(request.itemId);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "itemId or itemIds required"));
        }

        // Validate all items exist and belong to the same seller
        List<Item> items = new ArrayList<>();
        for (Long itemId : itemIds) {
            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Item not found: " + itemId));
            items.add(itemOpt.get());
        }

        User seller = items.get(0).getUser();
        for (Item item : items) {
            if (!item.getUser().getId().equals(seller.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "All items in a bundle must be from the same seller"));
            }
        }

        User buyer = buyerOpt.get();

        // Calculate bundle total
        BigDecimal itemTotal = items.stream()
                .map(Item::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Enforce minimum bundle value of R500 only once platform has 100+ listings
        long totalListings = itemRepository.countByStatus(Item.ItemStatus.AVAILABLE);
        if (totalListings >= 100 && itemTotal.compareTo(BigDecimal.valueOf(500)) < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Minimum bundle value is R500. Current total: R" + itemTotal.toPlainString()
            ));
        }

        // Use first item as the primary item for the order entity
        Item primaryItem = items.get(0);

        Order order = new Order();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setItem(primaryItem);
        order.setQuantity(items.size());
        order.setItemPrice(itemTotal); // store bundle total as item price
        order.setShippingCost(BigDecimal.valueOf(request.shippingCost != null ? request.shippingCost : 0));
        order.setTotalAmount(itemTotal.add(BigDecimal.valueOf(request.shippingCost != null ? request.shippingCost : 0)));
        order.setPickupPoint(request.pickupPoint);
        order.setDeliveryLockerId(request.deliveryLockerId);
        order.setServiceLevelCode(request.serviceLevelCode);

        Order saved = orderRepository.save(order);

        // Mark all items as RESERVED
        for (Item item : items) {
            item.setStatus(Item.ItemStatus.RESERVED);
            itemRepository.save(item);
        }

        fcmNotificationService.send(
                seller.getFcmToken(),
                "New Bundle Order!",
                "You have a new bundle order of " + items.size() + " item(s) totalling R" + itemTotal.toPlainString() + " (" + saved.getOrderNumber() + ")"
        );

        emailService.sendBuyerOrderConfirmation(saved);
        emailService.sendSellerOrderNotification(saved);

        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        List<Order> buyerOrders = orderRepository.findByBuyerOrderByCreatedAtDesc(user);
        List<Order> sellerOrders = orderRepository.findBySellerOrderByCreatedAtDesc(user);

        Map<String, Object> response = new HashMap<>();
        response.put("buyerOrders", buyerOrders.stream().map(this::toResponse).toList());
        response.put("sellerOrders", sellerOrders.stream().map(this::toResponse).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String email = authentication.getName();
        return orderRepository.findByOrderNumber(orderNumber)
            .filter(o -> o.getBuyer().getEmail().equals(email) || o.getSeller().getEmail().equals(email))
            .map(o -> ResponseEntity.ok(toResponse(o)))
            .orElse(ResponseEntity.status(404).body(null));
    }

    @PutMapping("/{orderNumber}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderNumber,
                                               @RequestBody Map<String, String> body,
                                               Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }
        return orderRepository.findByOrderNumber(orderNumber).map(order -> {
            try {
                Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                order.setOrderStatus(newStatus);
                orderRepository.save(order);

                // Notify the relevant party based on the new status
                switch (newStatus) {
                    case SHIPPED -> fcmNotificationService.send(
                            order.getBuyer().getFcmToken(),
                            "Your Order is On Its Way",
                            "Order " + orderNumber + " has been shipped. Check your orders for tracking details."
                    );
                    case DELIVERED -> fcmNotificationService.send(
                            order.getBuyer().getFcmToken(),
                            "Order Delivered",
                            "Order " + orderNumber + " has been delivered. Please confirm receipt in the app."
                    );
                    case CANCELLED -> {
                        fcmNotificationService.send(
                                order.getBuyer().getFcmToken(),
                                "Order Cancelled",
                                "Order " + orderNumber + " has been cancelled."
                        );
                        fcmNotificationService.send(
                                order.getSeller().getFcmToken(),
                                "Order Cancelled",
                                "Order " + orderNumber + " has been cancelled."
                        );
                    }
                    default -> { /* no notification for other transitions */ }
                }

                return ResponseEntity.ok(toResponse(order));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + status));
            }
        }).orElse(ResponseEntity.status(404).body(null));
    }

    @PostMapping("/{orderNumber}/confirm-delivery")
    public ResponseEntity<?> confirmDelivery(@PathVariable String orderNumber, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            escrowService.confirmDelivery(orderNumber);
            return ResponseEntity.ok(Map.of("message", "Delivery confirmed, funds released to seller"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Could not confirm delivery"));
        }
    }

    private Map<String, Object> toResponse(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderNumber", order.getOrderNumber());
        map.put("itemName", order.getItem().getItemName());
        map.put("itemImage", order.getItem().getFrontPhoto());
        map.put("itemPrice", order.getItemPrice());
        map.put("shippingCost", order.getShippingCost());
        map.put("buyerProtectionFee", order.getBuyerProtectionFee());
        map.put("quantity", order.getQuantity());
        map.put("totalAmount", order.getTotalAmount());
        map.put("orderStatus", order.getOrderStatus().name());
        map.put("paymentStatus", order.getPaymentStatus().name());
        map.put("escrowStatus", order.getEscrowStatus().name());
        map.put("sellerPayout", order.getSellerPayout());
        map.put("platformFee", order.getPlatformFee());
        map.put("deliveryConfirmed", order.getDeliveryConfirmed());
        map.put("pickupPoint", order.getPickupPoint());
        map.put("trackingNumber", order.getTrackingNumber());
        map.put("sellerAlias", "Seller #" + Long.toHexString(order.getSeller().getId()).toUpperCase());
        map.put("buyerAlias", "Buyer #" + Long.toHexString(order.getBuyer().getId()).toUpperCase());
        map.put("createdAt", order.getCreatedAt().toString());
        return map;
    }

    public static class CreateOrderRequest {
        public Long itemId;           // single item (legacy)
        public List<Long> itemIds;    // bundle of items
        public Integer quantity;
        public Double shippingCost;
        public String pickupPoint;
        public String deliveryLockerId;
        public String serviceLevelCode;
    }
}
