package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.Notification;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.NotificationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        List<Map<String, Object>> result = notificationService.getForUser(user)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        boolean found = notificationService.markAsRead(id, user);
        return found ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));

        boolean found = notificationService.delete(id, user);
        return found ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        return userOpt.orElse(null);
    }

    private Map<String, Object> toResponse(Notification n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("body", n.getBody());
        map.put("relatedOrderNumber", n.getRelatedOrderNumber());
        map.put("read", n.isRead());
        map.put("createdAt", n.getCreatedAt().toString());
        return map;
    }
}
