package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaystackService {

    private static final Logger log = LoggerFactory.getLogger(PaystackService.class);
    private static final String BASE_URL = "https://api.paystack.co";

    @Value("${paystack.secret.key}")
    private String secretKey;

    @Value("${app.base.url}")
    private String appBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;

    public PaystackService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(secretKey);
        return headers;
    }

    /**
     * Initialize a Paystack card-payment transaction.
     *
     * The sub-account split works as follows:
     *   - total amount is charged to the buyer
     *   - platform_fee (buyerProtectionFee) is kept by Eduthrift's main account
     *   - the remainder (sellerPayout) goes to the seller's Paystack sub-account
     *   - Paystack's own processing fee is borne by the sub-account (bearer = subaccount)
     *
     * Returns the Paystack-hosted authorization_url to redirect the buyer to.
     */
    @SuppressWarnings("unchecked")
    public String initializeTransaction(Order order) {
        User seller = order.getSeller();
        if (seller.getPaystackSubaccountCode() == null) {
            createSubaccount(seller);
        }

        // Paystack uses kobo (ZAR cents) — multiply by 100
        long totalKobo      = toKobo(order.getTotalAmount());
        long commissionKobo = toKobo(order.getPlatformFee());

        Map<String, Object> body = new HashMap<>();
        body.put("email",              order.getBuyer().getEmail());
        body.put("amount",             totalKobo);
        body.put("reference",          order.getOrderNumber());
        body.put("subaccount",         seller.getPaystackSubaccountCode());
        body.put("transaction_charge", commissionKobo); // Eduthrift's commission stays in main account
        body.put("bearer",             "subaccount");   // Paystack fees debited from seller's share
        body.put("callback_url",       appBaseUrl + "/payment/success?ref=" + order.getOrderNumber());
        body.put("metadata", Map.of(
                "order_number",  order.getOrderNumber(),
                "cancel_action", appBaseUrl + "/payment/cancelled"
        ));

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                BASE_URL + "/transaction/initialize",
                HttpMethod.POST,
                new HttpEntity<>(body, authHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || !Boolean.TRUE.equals(responseBody.get("status"))) {
            throw new RuntimeException("Paystack transaction initialization failed: "
                    + (responseBody != null ? responseBody.get("message") : "null response"));
        }

        Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
        return (String) data.get("authorization_url");
    }

    /**
     * Create a Paystack sub-account for a seller using their registered bank details.
     * Stored on the User entity so it is only created once per seller.
     *
     * Paystack bank codes for SA match standard branch codes:
     *   FNB 250655 | Standard Bank 051001 | ABSA 632005
     *   Nedbank 198765 | Capitec 470010 | TymeBank 678910
     */
    @SuppressWarnings("unchecked")
    public void createSubaccount(User seller) {
        if (seller.getBankAccountNumber() == null || seller.getBankBranchCode() == null) {
            throw new RuntimeException(
                    "Seller bank details missing — cannot create Paystack sub-account for user: "
                            + seller.getId());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("business_name",   seller.getFirstName() + " " + seller.getLastName());
        body.put("settlement_bank", seller.getBankBranchCode()); // SA branch code doubles as Paystack bank code
        body.put("account_number",  seller.getBankAccountNumber());
        body.put("percentage_charge", 0); // Commission is set per-transaction via transaction_charge

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                BASE_URL + "/subaccount",
                HttpMethod.POST,
                new HttpEntity<>(body, authHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || !Boolean.TRUE.equals(responseBody.get("status"))) {
            throw new RuntimeException("Paystack sub-account creation failed for seller "
                    + seller.getId() + ": "
                    + (responseBody != null ? responseBody.get("message") : "null response"));
        }

        Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
        seller.setPaystackSubaccountCode((String) data.get("subaccount_code"));
        userRepository.save(seller);
        log.info("Created Paystack sub-account {} for seller {}", seller.getPaystackSubaccountCode(), seller.getId());
    }

    /**
     * Pay a seller via Paystack Transfer after delivery is confirmed.
     * Used for PAYSTACK (card) orders — Paystack holds the funds until transfer is initiated.
     *
     * Process:
     *  1. Create a one-time Transfer Recipient from the seller's bank details
     *  2. Initiate a Transfer from Eduthrift's Paystack balance to the recipient
     */
    @SuppressWarnings("unchecked")
    public void initiateTransfer(Order order) {
        User seller = order.getSeller();
        if (seller.getBankAccountNumber() == null || seller.getBankBranchCode() == null) {
            throw new RuntimeException("Seller bank details missing for transfer on order: "
                    + order.getOrderNumber());
        }

        // Step 1 — Create transfer recipient
        Map<String, Object> recipientBody = new HashMap<>();
        recipientBody.put("type",           "nuban");
        recipientBody.put("name",           seller.getFirstName() + " " + seller.getLastName());
        recipientBody.put("account_number", seller.getBankAccountNumber());
        recipientBody.put("bank_code",      seller.getBankBranchCode());
        recipientBody.put("currency",       "ZAR");

        ResponseEntity<Map<String, Object>> recipientResponse = restTemplate.exchange(
                BASE_URL + "/transferrecipient",
                HttpMethod.POST,
                new HttpEntity<>(recipientBody, authHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> recipientData = (Map<String, Object>) recipientResponse.getBody().get("data");
        String recipientCode = (String) recipientData.get("recipient_code");

        // Step 2 — Initiate transfer
        Map<String, Object> transferBody = new HashMap<>();
        transferBody.put("source",    "balance");
        transferBody.put("amount",    toKobo(order.getSellerPayout()));
        transferBody.put("recipient", recipientCode);
        transferBody.put("reason",    "Eduthrift payout — " + order.getOrderNumber());

        restTemplate.exchange(
                BASE_URL + "/transfer",
                HttpMethod.POST,
                new HttpEntity<>(transferBody, authHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        log.info("Paystack transfer initiated for order {} — seller {} — amount R{}",
                order.getOrderNumber(), seller.getId(), order.getSellerPayout());
    }

    /**
     * Verify that a webhook request genuinely came from Paystack.
     * Paystack signs the raw request body using HMAC-SHA512 with your secret key
     * and puts the hex digest in the x-paystack-signature header.
     */
    public boolean verifyWebhookSignature(String rawPayload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Paystack signature verification error", e);
            return false;
        }
    }

    private long toKobo(BigDecimal rand) {
        return rand.multiply(BigDecimal.valueOf(100)).longValue();
    }
}
