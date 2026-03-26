package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.ItemRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.TCGShippingService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/shipping")
public class ShippingController {

    private final TCGShippingService tcgShippingService;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    public ShippingController(TCGShippingService tcgShippingService,
                               UserRepository userRepository,
                               ItemRepository itemRepository) {
        this.tcgShippingService = tcgShippingService;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Returns TCG lockers nearest to the given coordinates.
     * Public — called before checkout to show locker options.
     */
    @GetMapping("/pickup-points")
    public ResponseEntity<?> getPickupPoints(@RequestParam double lat, @RequestParam double lng) {
        try {
            List<Map<String, Object>> points = tcgShippingService.getPickupPoints(lat, lng);
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Could not load pickup points"));
        }
    }

    /**
     * Returns shipping rates from the seller's address to the buyer's chosen delivery locker.
     * Requires authentication so we can identify the buyer.
     * Request body: { "delivery_pickup_point_id": "CG01", "item_id": 123 }
     */
    @PostMapping("/rates")
    public ResponseEntity<?> getRates(@RequestBody Map<String, Object> request,
                                      Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String deliveryPickupPointId = (String) request.get("delivery_pickup_point_id");
        if (deliveryPickupPointId == null || deliveryPickupPointId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "delivery_pickup_point_id is required"));
        }

        // Look up seller via the item being purchased
        Object itemIdRaw = request.get("item_id");
        if (itemIdRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "item_id is required"));
        }
        Long itemId = Long.valueOf(itemIdRaw.toString());
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }

        User seller = itemOpt.get().getUser();

        try {
            List<Map<String, Object>> rates = tcgShippingService.getRates(seller, deliveryPickupPointId);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Could not calculate shipping rates"));
        }
    }

    /**
     * Returns courier rates for large-item door-to-door delivery.
     * Uses the seller's address (from item) and buyer's address (from their profile).
     * Neither party sees the other's address — it stays server-side.
     * Request body: { "item_id": 123 }
     */
    @PostMapping("/courier-rates")
    public ResponseEntity<?> getCourierRates(@RequestBody Map<String, Object> request,
                                             Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object itemIdRaw = request.get("item_id");
        if (itemIdRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "item_id is required"));
        }
        Long itemId = Long.valueOf(itemIdRaw.toString());
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }

        User seller = itemOpt.get().getUser();

        String buyerEmail = authentication.getName();
        Optional<User> buyerOpt = userRepository.findByEmail(buyerEmail);
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Buyer profile not found"));
        }
        User buyer = buyerOpt.get();

        if (buyer.getStreetAddress() == null || buyer.getStreetAddress().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please complete your delivery address in your profile before selecting courier delivery"));
        }

        try {
            List<Map<String, Object>> rates = tcgShippingService.getCourierRates(seller, buyer);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Could not calculate courier rates"));
        }
    }
}
