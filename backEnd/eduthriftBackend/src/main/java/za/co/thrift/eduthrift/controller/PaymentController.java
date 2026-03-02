package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.util.*;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class PaymentController {

    @Value("${ebanx.integration.key}")
    private String ebanxIntegrationKey;

    @Value("${ebanx.api.url:https://sandbox.ebanx.com}")
    private String ebanxApiUrl;

    @Value("${app.base.url:http://localhost:3000}")
    private String appBaseUrl;

    private final UserRepository userRepository;

    public PaymentController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/ozow/initiate")
    public ResponseEntity<?> initiateOzowPayment(@RequestBody PaymentRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        try {
            // Build EBANX request
            Map<String, Object> ebanxRequest = new HashMap<>();
            ebanxRequest.put("integration_key", ebanxIntegrationKey);
            
            Map<String, Object> payment = new HashMap<>();
            payment.put("payment_type_code", "ozow");
            payment.put("currency_code", "ZAR");
            payment.put("merchant_payment_code", request.orderId);
            payment.put("country", "ZA");
            payment.put("email", user.getEmail());
            payment.put("name", user.getFirstName() + " " + user.getLastName());
            payment.put("amount_total", String.valueOf(request.amount));
            payment.put("redirect_url", appBaseUrl + "/payment/callback");
            payment.put("notification_url", appBaseUrl + "/api/payments/ozow/webhook");
            
            if (request.bankCode != null && !request.bankCode.isEmpty()) {
                Map<String, Object> metadata = new HashMap<>();
                Map<String, String> bankDetails = new HashMap<>();
                bankDetails.put("bank_code", request.bankCode);
                metadata.put("bank_details", bankDetails);
                ebanxRequest.put("metadata", metadata);
            }
            
            ebanxRequest.put("payment", payment);

            // TODO: Make actual HTTP call to EBANX API
            // For now, return mock response for testing
            String redirectUrl = ebanxApiUrl + "/ws/redirect/execute?hash=" + UUID.randomUUID().toString();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "paymentUrl", redirectUrl,
                "hash", UUID.randomUUID().toString(),
                "status", "PE"
            ));

        } catch (Exception e) {
            System.err.println("Payment initiation failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to initiate payment: " + e.getMessage()));
        }
    }

    @GetMapping("/banks")
    public ResponseEntity<?> getBankList() {
        // TODO: Make actual call to EBANX getBankList API
        // For now, return common South African banks
        List<Map<String, String>> banks = Arrays.asList(
            Map.of("code", "ABSAZA", "name", "ABSA"),
            Map.of("code", "SBZAZAJJ", "name", "Standard Bank"),
            Map.of("code", "FIRNZAJJ", "name", "FNB"),
            Map.of("code", "NEDSZAJJ", "name", "Nedbank"),
            Map.of("code", "CABLZAJJ", "name", "Capitec"),
            Map.of("code", "DISCZAJJ", "name", "Discovery Bank"),
            Map.of("code", "TYMEZAJJ", "name", "TymeBank"),
            Map.of("code", "AFRCZAJJ", "name", "African Bank")
        );
        
        return ResponseEntity.ok(banks);
    }

    @PostMapping("/ozow/webhook")
    public ResponseEntity<?> handleOzowWebhook(@RequestBody Map<String, Object> notification) {
        try {
            System.out.println("Received Ozow webhook: " + notification);
            
            // Extract payment details
            String status = (String) notification.get("status");
            String merchantPaymentCode = (String) notification.get("merchant_payment_code");
            
            // TODO: Update order status based on payment status
            // CO = Confirmed, CA = Cancelled, PE = Pending
            
            return ResponseEntity.ok(Map.of("received", true));
        } catch (Exception e) {
            System.err.println("Webhook processing failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Webhook processing failed"));
        }
    }

    public static class PaymentRequest {
        public Double amount;
        public String orderId;
        public String customerEmail;
        public String customerName;
        public String description;
        public String bankCode;
    }
}
