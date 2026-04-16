package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Order;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

/**
 * Handles Ozow instant EFT payment URL generation and webhook verification.
 *
 * Important: Ozow is a payment gateway only — it facilitates instant EFT
 * directly to Eduthrift's designated bank account. Ozow does NOT hold funds.
 * The "escrow hold" for Ozow payments is managed entirely by Eduthrift's
 * order lifecycle — funds are in Eduthrift's collection account while
 * the order status is HELD. Seller payout is triggered manually by admin
 * (or via a batch payment service) after delivery is confirmed.
 */
@Service
public class OzowService {

    private static final Logger log = LoggerFactory.getLogger(OzowService.class);

    @Value("${ozow.site.code}")
    private String siteCode;

    @Value("${ozow.private.key}")
    private String privateKey;

    @Value("${ozow.is.test:true}")
    private boolean isTest;

    @Value("${app.base.url}")
    private String appBaseUrl;

    @Value("${api.base.url:https://api.eduthrift.co.za}")
    private String apiBaseUrl;

    /**
     * Build the Ozow payment redirect URL for a given order.
     * The buyer is redirected to this URL to complete instant EFT via their bank.
     */
    public String generatePaymentUrl(Order order) {
        String amount     = String.format("%.2f", order.getTotalAmount());
        String reference  = order.getOrderNumber();
        String bankRef    = "EDT-" + order.getId();
        String cancelUrl  = appBaseUrl + "/payment/cancelled";
        String errorUrl   = appBaseUrl + "/payment/error";
        String successUrl = appBaseUrl + "/payment/success?ref=" + reference;
        String notifyUrl  = apiBaseUrl + "/payments/ozow/webhook";
        String isTestStr  = String.valueOf(isTest);

        // Hash is SHA-512 of all params concatenated lowercase + private key
        String hashInput = (siteCode + "ZA" + "ZAR" + amount + reference + bankRef
                + cancelUrl + errorUrl + successUrl + notifyUrl + isTestStr + privateKey)
                .toLowerCase();

        String hash = sha512(hashInput);

        return "https://pay.ozow.com/?" +
                "SiteCode="              + encode(siteCode)    +
                "&CountryCode=ZA"                              +
                "&CurrencyCode=ZAR"                            +
                "&Amount="               + encode(amount)      +
                "&TransactionReference=" + encode(reference)   +
                "&BankReference="        + encode(bankRef)     +
                "&CancelUrl="            + encode(cancelUrl)   +
                "&ErrorUrl="             + encode(errorUrl)    +
                "&SuccessUrl="           + encode(successUrl)  +
                "&NotifyUrl="            + encode(notifyUrl)   +
                "&IsTest="               + isTestStr           +
                "&HashCheck="            + hash;
    }

    /**
     * Verify that an incoming Ozow webhook is genuine.
     * Ozow computes a SHA-512 hash of all returned parameters + private key (lowercase).
     * If the hash does not match, the request must be rejected.
     */
    public boolean verifyWebhookHash(Map<String, String> params) {
        String received = params.getOrDefault("Hash", "");

        // Concatenate all Ozow-returned fields in the documented order
        String input = (
                params.getOrDefault("SiteCode",            "") +
                params.getOrDefault("TransactionId",       "") +
                params.getOrDefault("TransactionReference","") +
                params.getOrDefault("SmartIndicator",      "") +
                params.getOrDefault("CurrencyCode",        "") +
                params.getOrDefault("Amount",              "") +
                params.getOrDefault("RequestedAmount",     "") +
                params.getOrDefault("SubStatus",           "") +
                params.getOrDefault("CreatedDate",         "") +
                params.getOrDefault("Optional1",           "") +
                params.getOrDefault("Optional2",           "") +
                params.getOrDefault("Optional3",           "") +
                params.getOrDefault("Optional4",           "") +
                params.getOrDefault("Optional5",           "") +
                params.getOrDefault("CancelledUrl",        "") +
                params.getOrDefault("ErrorUrl",            "") +
                params.getOrDefault("SuccessUrl",          "") +
                params.getOrDefault("IsTest",              "") +
                params.getOrDefault("StatusMessage",       "") +
                privateKey
        ).toLowerCase();

        boolean valid = sha512(input).equalsIgnoreCase(received);
        if (!valid) {
            log.warn("Ozow webhook hash mismatch for reference {}",
                    params.getOrDefault("TransactionReference", "unknown"));
        }
        return valid;
    }

    private String sha512(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-512 unavailable", e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
