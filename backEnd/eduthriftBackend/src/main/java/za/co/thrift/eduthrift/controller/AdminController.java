package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.LedgerEntry;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.PaymentTransaction;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.LedgerEntryRepository;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.repository.PaymentTransactionRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.service.EscrowService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EscrowService escrowService;

    public AdminController(UserRepository userRepository,
                           OrderRepository orderRepository,
                           LedgerEntryRepository ledgerEntryRepository,
                           PaymentTransactionRepository paymentTransactionRepository,
                           PasswordEncoder passwordEncoder,
                           EscrowService escrowService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.escrowService = escrowService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        // ── Users ────────────────────────────────────────────────────────────
        long totalUsers            = userRepository.count();
        long activeUsers           = userRepository.countByStatus("active");
        long pendingVerifications  = userRepository.countPendingSellerVerifications(
                Arrays.asList(User.UserType.SELLER, User.UserType.BOTH), "pending");

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

    @GetMapping("/reports/transactions")
    public ResponseEntity<?> getTransactionReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String status) {

        List<Order> orders = new ArrayList<>(orderRepository.findAll());

        if (from != null && !from.isEmpty()) {
            LocalDateTime fromDt = LocalDate.parse(from).atStartOfDay();
            orders.removeIf(o -> o.getCreatedAt() == null || o.getCreatedAt().isBefore(fromDt));
        }
        if (to != null && !to.isEmpty()) {
            LocalDateTime toDt = LocalDate.parse(to).plusDays(1).atStartOfDay();
            orders.removeIf(o -> o.getCreatedAt() == null || !o.getCreatedAt().isBefore(toDt));
        }
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            try {
                Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                orders.removeIf(o -> o.getOrderStatus() != orderStatus);
            } catch (IllegalArgumentException ignored) {}
        }

        orders.sort((a, b) -> {
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        List<Map<String, Object>> rows = orders.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", o.getId());
            m.put("order_number", o.getOrderNumber());
            m.put("buyer_name", o.getBuyer().getFirstName() + " " + o.getBuyer().getLastName());
            m.put("buyer_email", o.getBuyer().getEmail());
            m.put("seller_name", o.getSeller().getFirstName() + " " + o.getSeller().getLastName());
            m.put("seller_email", o.getSeller().getEmail());
            m.put("item_name", o.getItem() != null ? o.getItem().getItemName() : "N/A");
            m.put("quantity", o.getQuantity());
            m.put("item_price", o.getItemPrice());
            m.put("shipping_cost", o.getShippingCost());
            m.put("total_amount", o.getTotalAmount());
            m.put("platform_fee", o.getPlatformFee());
            m.put("seller_payout", o.getSellerPayout());
            m.put("order_status", o.getOrderStatus() != null ? o.getOrderStatus().name() : null);
            m.put("payment_status", o.getPaymentStatus() != null ? o.getPaymentStatus().name() : null);
            m.put("escrow_status", o.getEscrowStatus() != null ? o.getEscrowStatus().name() : null);
            m.put("payout_status", o.getPayoutStatus() != null ? o.getPayoutStatus().name() : null);
            m.put("payment_method", o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null);
            m.put("created_at", o.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        BigDecimal totalVolume = orders.stream()
                .map(Order::getTotalAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFees = orders.stream()
                .map(Order::getPlatformFee).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactions", rows);
        response.put("total_count", rows.size());
        response.put("total_volume", totalVolume);
        response.put("total_fees", totalFees);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/users")
    public ResponseEntity<?> getUserReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String userType) {

        List<User> users = new ArrayList<>(userRepository.findAll());

        if (from != null && !from.isEmpty()) {
            LocalDateTime fromDt = LocalDate.parse(from).atStartOfDay();
            users.removeIf(u -> u.getCreatedAt() == null || u.getCreatedAt().isBefore(fromDt));
        }
        if (to != null && !to.isEmpty()) {
            LocalDateTime toDt = LocalDate.parse(to).plusDays(1).atStartOfDay();
            users.removeIf(u -> u.getCreatedAt() == null || !u.getCreatedAt().isBefore(toDt));
        }
        if (userType != null && !userType.isEmpty() && !userType.equalsIgnoreCase("all")) {
            try {
                User.UserType type = User.UserType.valueOf(userType.toUpperCase());
                users.removeIf(u -> u.getUserType() != type);
            } catch (IllegalArgumentException ignored) {}
        }

        users.sort((a, b) -> {
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        long buyerCount  = users.stream().filter(u -> u.getUserType() == User.UserType.BUYER).count();
        long sellerCount = users.stream().filter(u -> u.getUserType() == User.UserType.SELLER || u.getUserType() == User.UserType.BOTH).count();
        long pendingCount  = users.stream().filter(u -> "pending".equals(u.getVerificationStatus())).count();
        long verifiedCount = users.stream().filter(u -> "verified".equals(u.getVerificationStatus())).count();

        List<Map<String, Object>> rows = users.stream()
                .map(this::userToSnakeCaseMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("users", rows);
        response.put("total_count", rows.size());
        response.put("buyer_count", buyerCount);
        response.put("seller_count", sellerCount);
        response.put("pending_verifications", pendingCount);
        response.put("verified_count", verifiedCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/general-ledger")
    public ResponseEntity<?> getGeneralLedger(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String accountType) {

        LocalDateTime fromDt = (from != null && !from.isEmpty())
                ? LocalDate.parse(from).atStartOfDay()
                : LocalDateTime.of(2020, 1, 1, 0, 0);
        LocalDateTime toDt = (to != null && !to.isEmpty())
                ? LocalDate.parse(to).plusDays(1).atStartOfDay()
                : LocalDateTime.now().plusDays(1);

        List<LedgerEntry> entries;
        if (accountType != null && !accountType.isEmpty() && !accountType.equalsIgnoreCase("all")) {
            try {
                LedgerEntry.AccountType acct = LedgerEntry.AccountType.valueOf(accountType.toUpperCase());
                entries = ledgerEntryRepository.findWithOrderByAccountTypeAndDateRange(acct, fromDt, toDt);
            } catch (IllegalArgumentException e) {
                entries = ledgerEntryRepository.findWithOrderByDateRange(fromDt, toDt);
            }
        } else {
            entries = ledgerEntryRepository.findWithOrderByDateRange(fromDt, toDt);
        }

        List<Map<String, Object>> rows = entries.stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", e.getId());
            m.put("date", e.getCreatedAt());
            m.put("order_number", e.getOrder().getOrderNumber());
            m.put("account_type", e.getAccountType().name());
            m.put("entry_type", e.getEntryType().name());
            m.put("amount", e.getAmount());
            m.put("reference_type", e.getReferenceType().name());
            m.put("description", e.getDescription());
            return m;
        }).collect(Collectors.toList());

        BigDecimal totalDebits = entries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.DEBIT)
                .map(LedgerEntry::getAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = entries.stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.CREDIT)
                .map(LedgerEntry::getAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("entries", rows);
        response.put("total_count", rows.size());
        response.put("total_debits", totalDebits);
        response.put("total_credits", totalCredits);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/trial-balance")
    public ResponseEntity<?> getTrialBalance(@RequestParam(required = false) String asAt) {
        LocalDateTime asAtDt = (asAt != null && !asAt.isEmpty())
                ? LocalDate.parse(asAt).plusDays(1).atStartOfDay()
                : LocalDateTime.now().plusDays(1);

        List<Map<String, Object>> rows = new ArrayList<>();
        BigDecimal grandTotalDebits = BigDecimal.ZERO;
        BigDecimal grandTotalCredits = BigDecimal.ZERO;

        for (LedgerEntry.AccountType account : LedgerEntry.AccountType.values()) {
            List<LedgerEntry> debits = ledgerEntryRepository.findByAccountTypeAndEntryType(
                    account, LedgerEntry.EntryType.DEBIT).stream()
                    .filter(e -> e.getCreatedAt().isBefore(asAtDt))
                    .collect(Collectors.toList());
            List<LedgerEntry> credits = ledgerEntryRepository.findByAccountTypeAndEntryType(
                    account, LedgerEntry.EntryType.CREDIT).stream()
                    .filter(e -> e.getCreatedAt().isBefore(asAtDt))
                    .collect(Collectors.toList());

            BigDecimal debitTotal = debits.stream().map(LedgerEntry::getAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal creditTotal = credits.stream().map(LedgerEntry::getAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal balance = creditTotal.subtract(debitTotal);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("account", account.name());
            row.put("debit_total", debitTotal);
            row.put("credit_total", creditTotal);
            row.put("balance", balance);
            rows.add(row);

            grandTotalDebits = grandTotalDebits.add(debitTotal);
            grandTotalCredits = grandTotalCredits.add(creditTotal);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accounts", rows);
        response.put("grand_total_debits", grandTotalDebits);
        response.put("grand_total_credits", grandTotalCredits);
        response.put("balanced", grandTotalDebits.compareTo(grandTotalCredits) == 0);
        response.put("as_at", asAt != null ? asAt : LocalDate.now().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/vat")
    public ResponseEntity<?> getVatReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        LocalDateTime fromDt = (from != null && !from.isEmpty())
                ? LocalDate.parse(from).atStartOfDay()
                : LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime toDt = (to != null && !to.isEmpty())
                ? LocalDate.parse(to).plusDays(1).atStartOfDay()
                : LocalDateTime.now().plusDays(1);

        List<LedgerEntry> platformCredits = ledgerEntryRepository
                .findWithOrderByAccountTypeAndDateRange(LedgerEntry.AccountType.PLATFORM, fromDt, toDt)
                .stream()
                .filter(e -> e.getEntryType() == LedgerEntry.EntryType.CREDIT)
                .collect(Collectors.toList());

        // Group by year-month
        Map<String, List<LedgerEntry>> byMonth = platformCredits.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        BigDecimal vat15 = new BigDecimal("15");
        BigDecimal vat115 = new BigDecimal("115");

        List<Map<String, Object>> monthlyRows = new ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;

        for (Map.Entry<String, List<LedgerEntry>> entry : new TreeMap<>(byMonth).entrySet()) {
            BigDecimal gross = entry.getValue().stream()
                    .map(LedgerEntry::getAmount).filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal vat = gross.multiply(vat15).divide(vat115, 2, RoundingMode.HALF_UP);
            BigDecimal net = gross.subtract(vat);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("tax_period", entry.getKey());
            row.put("transaction_count", entry.getValue().size());
            row.put("gross_revenue_incl_vat", gross);
            row.put("net_revenue_excl_vat", net);
            row.put("output_vat_15pct", vat);
            monthlyRows.add(row);

            totalGross = totalGross.add(gross);
            totalNet = totalNet.add(net);
            totalVat = totalVat.add(vat);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("monthly_breakdown", monthlyRows);
        response.put("total_gross_revenue_incl_vat", totalGross);
        response.put("total_net_revenue_excl_vat", totalNet);
        response.put("total_output_vat", totalVat);
        response.put("vat_rate", "15%");
        response.put("statutory_reference", "VAT Act 89 of 1991 — Output Tax (Standard Rate)");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/audit-trail")
    public ResponseEntity<?> getAuditTrail(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        LocalDateTime fromDt = (from != null && !from.isEmpty())
                ? LocalDate.parse(from).atStartOfDay()
                : LocalDateTime.of(2020, 1, 1, 0, 0);
        LocalDateTime toDt = (to != null && !to.isEmpty())
                ? LocalDate.parse(to).plusDays(1).atStartOfDay()
                : LocalDateTime.now().plusDays(1);

        List<PaymentTransaction> transactions = paymentTransactionRepository.findWithOrderByDateRange(fromDt, toDt);

        List<Map<String, Object>> rows = transactions.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("date", t.getCreatedAt());
            m.put("order_number", t.getOrder().getOrderNumber());
            m.put("provider", t.getProvider());
            m.put("provider_transaction_id", t.getProviderTransactionId() != null ? t.getProviderTransactionId() : "—");
            m.put("event_type", t.getEventType());
            m.put("amount", t.getAmount());
            m.put("status", t.getStatus());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("audit_trail", rows);
        response.put("total_count", rows.size());

        return ResponseEntity.ok(response);
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

    // ── Dispute management ────────────────────────────────────────────────────

    @GetMapping("/orders/disputes")
    public ResponseEntity<?> getOpenDisputes() {
        List<Order> disputes = orderRepository.findByDisputeStatus(Order.DisputeStatus.OPEN);
        List<Map<String, Object>> result = disputes.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("orderNumber", o.getOrderNumber());
            m.put("buyerName", o.getBuyer().getFirstName() + " " + o.getBuyer().getLastName());
            m.put("buyerEmail", o.getBuyer().getEmail());
            m.put("sellerName", o.getSeller().getFirstName() + " " + o.getSeller().getLastName());
            m.put("sellerEmail", o.getSeller().getEmail());
            m.put("itemName", o.getItem().getItemName());
            m.put("totalAmount", o.getTotalAmount());
            m.put("escrowAmount", o.getEscrowAmount());
            m.put("disputeReason", o.getDisputeReason());
            m.put("disputeRaisedAt", o.getDisputeRaisedAt());
            m.put("escrowStatus", o.getEscrowStatus().name());
            m.put("trackingNumber", o.getTrackingNumber());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/orders/{orderNumber}/resolve-dispute")
    public ResponseEntity<?> resolveDispute(@PathVariable String orderNumber,
                                            @RequestBody Map<String, String> body) {
        String resolution = body.get("resolution");
        if (!"refund".equals(resolution) && !"release".equals(resolution)) {
            return ResponseEntity.badRequest().body(Map.of("error", "resolution must be 'refund' or 'release'"));
        }
        try {
            if ("refund".equals(resolution)) {
                escrowService.resolveDisputeAsRefund(orderNumber);
            } else {
                escrowService.resolveDisputeAsRelease(orderNumber);
            }
            return ResponseEntity.ok(Map.of("message", "Dispute resolved as " + resolution + " for order " + orderNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
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
