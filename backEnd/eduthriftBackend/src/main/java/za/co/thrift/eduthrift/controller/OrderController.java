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

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final EscrowService escrowService;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, 
                          ItemRepository itemRepository, EscrowService escrowService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.escrowService = escrowService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> buyerOpt = userRepository.findByEmail(email);
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Optional<Item> itemOpt = itemRepository.findById(request.itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }

        Item item = itemOpt.get();
        User buyer = buyerOpt.get();
        User seller = item.getUser();

        Order order = new Order();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setItem(item);
        order.setQuantity(request.quantity);
        order.setItemPrice(item.getPrice());
        order.setShippingCost(BigDecimal.valueOf(request.shippingCost));
        order.setTotalAmount(item.getPrice().multiply(BigDecimal.valueOf(request.quantity))
                .add(BigDecimal.valueOf(request.shippingCost)));
        order.setPickupPoint(request.pickupPoint);

        Order saved = orderRepository.save(order);
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
                order.setOrderStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
                orderRepository.save(order);
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
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toResponse(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderNumber", order.getOrderNumber());
        map.put("itemName", order.getItem().getItemName());
        map.put("quantity", order.getQuantity());
        map.put("totalAmount", order.getTotalAmount());
        map.put("orderStatus", order.getOrderStatus().name());
        map.put("paymentStatus", order.getPaymentStatus().name());
        map.put("escrowStatus", order.getEscrowStatus().name());
        map.put("sellerPayout", order.getSellerPayout());
        map.put("platformFee", order.getPlatformFee());
        map.put("deliveryConfirmed", order.getDeliveryConfirmed());
        map.put("createdAt", order.getCreatedAt().toString());
        return map;
    }

    public static class CreateOrderRequest {
        public Long itemId;
        public Integer quantity;
        public Double shippingCost;
        public String pickupPoint;
    }
}
