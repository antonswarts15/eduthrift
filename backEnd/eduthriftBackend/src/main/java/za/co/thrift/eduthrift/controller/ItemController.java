package za.co.thrift.eduthrift.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.ItemType;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.ItemRepository;
import za.co.thrift.eduthrift.repository.ItemTypeRepository;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/items")
public class ItemController {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemTypeRepository itemTypeRepository;

    public ItemController(ItemRepository itemRepository, UserRepository userRepository, ItemTypeRepository itemTypeRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.itemTypeRepository = itemTypeRepository;
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody CreateItemRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            User user = userOpt.get();
            Item item = new Item();
            item.setUser(user);
            item.setItemName(request.itemName != null ? request.itemName : request.name);
            item.setCategory(request.category);
            item.setSubcategory(request.subcategory);
            item.setSport(request.sport);
            item.setSchoolName(request.schoolName != null ? request.schoolName : request.school);
            item.setClubName(request.clubName);
            item.setSize(request.size);
            item.setDescription(request.description);
            item.setFrontPhoto(request.frontPhoto);
            item.setBackPhoto(request.backPhoto);
            item.setQuantity(request.quantity != null ? request.quantity : 1);
            item.setLargeItem(request.largeItem != null && request.largeItem);
            item.setStatus(Item.ItemStatus.AVAILABLE);

            if (request.price == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Price is required"));
            }
            if (request.price <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Price must be greater than zero"));
            }
            item.setPrice(BigDecimal.valueOf(request.price));

            String itemName = request.itemName != null ? request.itemName : request.name;
            if (itemName == null || itemName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Item name is required"));
            }

            if (request.conditionGrade != null) {
                item.setConditionGrade(request.conditionGrade);
            }

            if (request.gender != null) {
                try {
                    item.setGender(Item.Gender.valueOf(request.gender.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    item.setGender(Item.Gender.UNISEX);
                }
            }

            // Fallback for item_type_id NOT NULL constraint
            List<ItemType> itemTypes = itemTypeRepository.findAll();
            if (!itemTypes.isEmpty()) {
                item.setItemType(itemTypes.get(0));
            } else {
                // Create a dummy item type if none exists to prevent 500 error
                try {
                    ItemType defaultType = new ItemType();
                    defaultType.setName("General");
                    defaultType.setSlug("general-" + UUID.randomUUID().toString());
                    ItemType savedType = itemTypeRepository.save(defaultType);
                    item.setItemType(savedType);
                } catch (Exception ignored) {
                    // If this fails the item save will propagate the error
                }
            }

            Item saved = itemRepository.save(item);
            return ResponseEntity.ok(toResponse(saved, user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create item. Please try again."));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllItems(
            @RequestParam(required = false) Long itemTypeId,
            @RequestParam(required = false) String schoolName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            Item.ItemStatus itemStatus = status != null ? Item.ItemStatus.valueOf(status.toUpperCase()) : null;
            String keyword = (search != null && !search.isBlank()) ? search.trim() : null;
            List<Item> items = itemRepository.findByFilters(itemTypeId, schoolName, itemStatus, keyword);
            List<Map<String, Object>> response = new ArrayList<>();
            for (Item item : items) {
                response.add(toResponse(item, item.getUser()));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch items"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }
        Item item = itemOpt.get();
        return ResponseEntity.ok(toResponse(item, item.getUser()));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getItemCount() {
        long count = itemRepository.countByStatus(Item.ItemStatus.AVAILABLE);
        return ResponseEntity.ok(Map.of("count", count, "minimumActive", count >= 100));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyItems(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        List<Item> items = itemRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
        User user = userOpt.get();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Item item : items) {
            response.add(toResponse(item, user));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/seller-items")
    public ResponseEntity<?> getSellerItems(@PathVariable Long id) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        Item item = itemOpt.get();
        List<Item> sellerItems = itemRepository.findOtherItemsBySeller(item.getUser().getId(), id);
        List<Map<String, Object>> response = new ArrayList<>();
        for (Item si : sellerItems) response.add(toResponse(si, si.getUser()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Map<String, Object> updates, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }

        Item item = itemOpt.get();
        if (!item.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to update this item"));
        }

        if (updates.containsKey("item_name")) item.setItemName((String) updates.get("item_name"));
        if (updates.containsKey("school_name")) item.setSchoolName((String) updates.get("school_name"));
        if (updates.containsKey("description")) item.setDescription((String) updates.get("description"));
        if (updates.containsKey("size")) item.setSize((String) updates.get("size"));
        if (updates.containsKey("condition_grade")) item.setConditionGrade((Integer) updates.get("condition_grade"));
        if (updates.containsKey("quantity")) item.setQuantity((Integer) updates.get("quantity"));
        if (updates.containsKey("price")) {
            Object priceObj = updates.get("price");
            if (priceObj instanceof Number) {
                double price = ((Number) priceObj).doubleValue();
                if (price <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Price must be greater than zero"));
                }
                item.setPrice(BigDecimal.valueOf(price));
            }
        }
        if (updates.containsKey("quantity")) {
            Object qtyObj = updates.get("quantity");
            if (qtyObj instanceof Number && ((Number) qtyObj).intValue() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity cannot be negative"));
            }
        }
        if (updates.containsKey("gender")) {
            try {
                item.setGender(Item.Gender.valueOf(((String) updates.get("gender")).toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("front_photo")) item.setFrontPhoto((String) updates.get("front_photo"));
        if (updates.containsKey("back_photo")) item.setBackPhoto((String) updates.get("back_photo"));

        Item saved = itemRepository.save(item);
        return ResponseEntity.ok(toResponse(saved, userOpt.get()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
        }

        Item item = itemOpt.get();
        if (!item.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this item"));
        }

        itemRepository.delete(item);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }

    private Map<String, Object> toResponse(Item item, User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("item_name", item.getItemName());
        map.put("name", item.getItemName());
        map.put("category", item.getCategory());
        map.put("subcategory", item.getSubcategory());
        map.put("sport", item.getSport());
        map.put("school_name", item.getSchoolName());
        map.put("club_name", item.getClubName());
        map.put("size", item.getSize());
        map.put("gender", item.getGender() != null ? item.getGender().name() : null);
        map.put("condition_grade", item.getConditionGrade());
        map.put("price", item.getPrice());
        map.put("front_photo", item.getFrontPhoto());
        map.put("back_photo", item.getBackPhoto());
        map.put("description", item.getDescription());
        map.put("quantity", item.getQuantity());
        map.put("status", item.getStatus() != null ? item.getStatus().name().toLowerCase() : "available");
        map.put("sold_out", item.getQuantity() != null && item.getQuantity() == 0);
        map.put("created_at", item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
        map.put("updated_at", item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null);
        map.put("large_item", item.getLargeItem() != null && item.getLargeItem());
        map.put("seller_id", user.getId());
        map.put("seller_alias", "Seller #" + Long.toHexString(user.getId()).toUpperCase());
        map.put("seller_town", user.getTown());
        map.put("seller_province", user.getProvince());
        return map;
    }

    public static class CreateItemRequest {
        @JsonProperty("item_name")
        public String itemName;
        public String name;
        public String category;
        public String subcategory;
        public String sport;
        @JsonProperty("school_name")
        public String schoolName;
        public String school;
        @JsonProperty("club_name")
        public String clubName;
        public String size;
        public String gender;
        @JsonProperty("condition_grade")
        public Integer conditionGrade;
        public Double price;
        @JsonProperty("front_photo")
        public String frontPhoto;
        @JsonProperty("back_photo")
        public String backPhoto;
        public String description;
        public Integer quantity;
        @JsonProperty("large_item")
        public Boolean largeItem;
    }
}
