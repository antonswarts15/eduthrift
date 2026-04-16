package za.co.thrift.eduthrift.service.payment.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.service.OzowService;
import za.co.thrift.eduthrift.service.payment.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * {@link PaymentProvider} adapter for Ozow (instant EFT).
 *
 * <h2>Ozow specifics</h2>
 * <ul>
 *   <li>Webhook format: HTML form POST ({@code application/x-www-form-urlencoded}),
 *       verified with SHA-512 of concatenated parameters + private key.</li>
 *   <li>Payment event: {@code Status=Complete} → {@link PaymentEventType#PAYMENT_CONFIRMED}</li>
 *   <li>Payout: <strong>Not supported programmatically.</strong> Ozow EFT funds land directly
 *       in Eduthrift's designated bank account. Seller payouts require a manual admin bank
 *       transfer. This provider returns {@link PayoutResult#manual(String)} which causes
 *       {@link za.co.thrift.eduthrift.service.payment.PaymentService} to set
 *       {@code payout_status = MANUAL_REQUIRED}.</li>
 * </ul>
 */
@Component
public class OzowProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(OzowProvider.class);

    private final OzowService ozowService;

    public OzowProvider(OzowService ozowService) {
        this.ozowService = ozowService;
    }

    @Override
    public String getProviderName() {
        return "OZOW";
    }

    @Override
    public boolean supportsPayouts() {
        return false;
    }

    @Override
    public PaymentResult initiatePayment(Order order) {
        try {
            String url = ozowService.generatePaymentUrl(order);
            return PaymentResult.success(url, order.getOrderNumber());
        } catch (Exception e) {
            log.error("Ozow initiation failed for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            return PaymentResult.failure("Could not initiate EFT payment");
        }
    }

    @Override
    public PaymentEvent parseWebhook(WebhookRequest request) {
        Map<String, String> params = request.formParams();

        if (!ozowService.verifyWebhookHash(params)) {
            throw new WebhookVerificationException("Ozow webhook hash mismatch — possible forgery");
        }

        String reference     = params.getOrDefault("TransactionReference", "");
        String transactionId = params.getOrDefault("TransactionId", reference);
        String status        = params.getOrDefault("Status", "");
        String amountStr     = params.getOrDefault("Amount", "0");

        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr);
        } catch (NumberFormatException e) {
            log.warn("Ozow webhook: unparseable Amount '{}' for reference {}", amountStr, reference);
            amount = BigDecimal.ZERO;
        }

        PaymentEventType type = switch (status) {
            case "Complete"             -> PaymentEventType.PAYMENT_CONFIRMED;
            case "Cancelled"            -> PaymentEventType.PAYMENT_CANCELLED;
            case "Error"                -> PaymentEventType.PAYMENT_FAILED;
            case "PendingInvestigation" -> PaymentEventType.PAYMENT_INITIATED;
            default                     -> {
                log.debug("Ozow webhook: unhandled status '{}' for reference {}", status, reference);
                yield PaymentEventType.PAYMENT_INITIATED;
            }
        };

        log.debug("Ozow webhook received: status={}, reference={}, type={}", status, reference, type);

        return new PaymentEvent(
                type,
                reference,
                getProviderName(),
                transactionId,
                amount,
                params.toString(),
                Map.of("status", status),
                Instant.now()
        );
    }

    @Override
    public PayoutResult payoutSeller(Order order) {
        // Ozow does not have a disbursement API. Funds arrive in Eduthrift's bank account;
        // the admin team must manually EFT the seller payout.
        log.info("Order {} (Ozow) queued for manual seller payout — seller ID {} — amount R{}",
                order.getOrderNumber(), order.getSeller().getId(), order.getSellerPayout());
        return PayoutResult.manual(
                "Ozow EFT: funds in Eduthrift collection account, manual bank transfer required for seller "
                        + order.getSeller().getId());
    }
}
