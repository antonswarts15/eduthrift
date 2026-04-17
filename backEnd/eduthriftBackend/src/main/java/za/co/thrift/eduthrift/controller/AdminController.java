package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.LedgerEntry;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.LedgerEntryRepository;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           OrderRepository orderRepository,
                           LedgerEntryRepository ledgerEntryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        // ── Users ────────────────────────────────────────────────────────────
        long totalUsers            = userRepository.count();
        long activeUsers           = userRepository.countByStatus("active");
        long pendingVerifications  = userRepository.countByVerificationStatus("pending");

        // ── Orders ───────────────────────────────────────────────────────────
        long totalOrders     = orderRepository.count();
        long completedOrders = orderRepository.countByOrderStatus(Order.OrderStatus.COMPLETED);
        BigDecimal totalGmv  = orderRepository.sumTotalAmountByOrderStatus(Order.OrderStatus.COMPLETED);

        // ── Ledger ───────────────────────────────────────────────────────────
        BigDecimal platformRevenue     = ledgerEntryRepository.getBalance(LedgerEntry.AccountType.PLATFORM);
        BigDecimal escrowBalance       = ledgerEntryRepository.getBalance(LedgerEntry.AccountType.ESCROW);
        BigDecimal outstandingSellers  = ledgerEntryRepository.getTotalOutstandingSellerBalance();

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        BigDecimal revenueThisMonth = ledgerEntryRepository.getPlatformRevenueBetween(monthStart, LocalDateTime.now());

        // ── Payout safety ────────────────────────────────────────────────────
        long failedPayouts         = orderRepository.countByPayoutStatus(Order.PayoutStatus.FAILED);
        long manualPayoutsRequired = orderRepository.countByPayoutStatus(Order.PayoutStatus.MANUAL_REQUIRED);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers",            totalUsers);
        stats.put("activeUsers",           activeUsers);
        stats.put("pendingVerifications",  pendingVerifications);
        stats.put("totalOrders",           totalOrders);
        stats.put("completedOrders",       completedOrders);
        stats.put("totalGmv",              totalGmv);
        stats.put("platformRevenue",       platformRevenue);
        stats.put("revenueThisMonth",      revenueThisMonth);
        stats.put("escrowBalance",         escrowBalance);
        stats.put("outstandingSellerPayouts", outstandingSellers);
        stats.put("failedPayouts",         failedPayouts);
        stats.put("manualPayoutsRequired", manualPayoutsRequired);

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

        // Note: in production, send the temp password via email to the user.
        // It is intentionally NOT returned in the response body for security.
        return ResponseEntity.ok(Map.of("message", "Password reset successful. User must contact support to receive their temporary password."));
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

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
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
