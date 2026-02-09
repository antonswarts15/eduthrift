package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://154.65.107.50:3000", "http://154.65.107.50:3001", "http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("active");
        long pendingVerifications = userRepository.countByVerificationStatus("pending");

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingVerifications", pendingVerifications);
        stats.put("totalSales", 0);
        stats.put("totalOrders", 0);
        stats.put("platformFees", 0);
        stats.put("recentTransactions", 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "all") String role,
            @RequestParam(required = false) String search) {

        List<User> users;

        if (search != null && !search.trim().isEmpty()) {
            if ("all".equalsIgnoreCase(role)) {
                users = userRepository.searchUsers(search.trim());
            } else {
                try {
                    User.UserType userType = User.UserType.valueOf(role.toUpperCase());
                    users = userRepository.searchUsersByType(userType, search.trim());
                } catch (IllegalArgumentException e) {
                    users = userRepository.searchUsers(search.trim());
                }
            }
        } else {
            if ("all".equalsIgnoreCase(role)) {
                users = userRepository.findAll();
            } else {
                try {
                    User.UserType userType = User.UserType.valueOf(role.toUpperCase());
                    users = userRepository.findByUserType(userType);
                } catch (IllegalArgumentException e) {
                    users = userRepository.findAll();
                }
            }
        }

        List<Map<String, Object>> result = users.stream()
                .map(this::userToSnakeCaseMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/sellers/pending")
    public ResponseEntity<?> getPendingSellers() {
        List<User> sellers = userRepository.findByUserTypeInAndVerificationStatus(
                Arrays.asList(User.UserType.SELLER, User.UserType.BOTH),
                "pending"
        );

        List<Map<String, Object>> result = sellers.stream()
                .map(this::userToSnakeCaseMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/sellers/{id}/verify")
    public ResponseEntity<?> verifySeller(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setSellerVerified(true);
        user.setVerificationStatus("verified");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Seller verified successfully"));
    }

    @PutMapping("/sellers/{id}/reject")
    public ResponseEntity<?> rejectSeller(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setSellerVerified(false);
        user.setVerificationStatus("rejected");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Seller verification rejected"));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("userType");
        if (newRole == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userType is required"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        try {
            user.setUserType(User.UserType.valueOf(newRole.toUpperCase()));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User role updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + newRole));
        }
    }

    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        String tempPassword = generateTempPassword();
        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Password reset successful",
                "tempPassword", tempPassword
        ));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setStatus("suspended");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User suspended"));
    }

    @PutMapping("/users/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setStatus("active");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User reactivated"));
    }

    private Map<String, Object> userToSnakeCaseMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("first_name", user.getFirstName());
        map.put("last_name", user.getLastName());
        map.put("phone", user.getPhone());
        map.put("user_type", user.getUserType() != null ? user.getUserType().name().toLowerCase() : null);
        map.put("school_name", user.getSchoolName());
        map.put("town", user.getTown());
        map.put("suburb", user.getSuburb());
        map.put("province", user.getProvince());
        map.put("status", user.getStatus() != null ? user.getStatus() : "active");
        map.put("seller_verified", user.getSellerVerified());
        map.put("verification_status", user.getVerificationStatus());
        map.put("id_document_url", user.getIdDocumentUrl());
        map.put("proof_of_address_url", user.getProofOfAddressUrl());
        map.put("id_number", user.getIdNumber());
        map.put("street_address", user.getStreetAddress());
        map.put("bank_name", user.getBankName());
        map.put("bank_account_number", user.getBankAccountNumber());
        map.put("bank_account_type", user.getBankAccountType());
        map.put("bank_branch_code", user.getBankBranchCode());
        map.put("created_at", user.getCreatedAt());
        map.put("updated_at", user.getUpdatedAt());
        return map;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
