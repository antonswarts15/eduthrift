package za.co.thrift.eduthrift.service.payment.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.service.PaystackService;
import za.co.thrift.eduthrift.service.payment.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * {@link PaymentProvider} adapter for Paystack (card payments).
 *
 * <p>Delegates all low-level HTTP calls to the existing {@link PaystackService}
 * so that service can continue to be used independently if needed. This adapter
 * only adds the normalization layer on top.
 *
 * <h2>Paystack specifics</h2>
 * <ul>
 *   <li>Webhook signature: HMAC-SHA512 of the raw JSON body, sent in
 *       the {@code x-paystack-signature} header.</li>
 *   <li>Payment event: {@code charge.success} → {@link PaymentEventType#PAYMENT_CONFIRMED}</li>
 *   <li>Payout: Paystack Transfer API to a registered recipient. Supported.</li>
 * </ul>
 */
@Component
public class PaystackProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(PaystackProvider.class);

    private final PaystackService paystackService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaystackProvider(PaystackService paystackService) {
        this.paystackService = paystackService;
    }

    @Override
    public String getProviderName() {
        return "PAYSTACK";
    }

    @Override
    public boolean supportsPayouts() {
        return true;
    }

    @Override
    public PaymentResult initiatePayment(Order order) {
        try {
            String url = paystackService.initializeTransaction(order);
            return PaymentResult.success(url, order.getOrderNumber());
        } catch (Exception e) {
            log.error("Paystack initiation failed for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            return PaymentResult.failure("Could not initiate card payment");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public PaymentEvent parseWebhook(WebhookRequest request) {
        String signature = request.headers().get("x-paystack-signature");
        if (signature == null || !paystackService.verifyWebhookSignature(request.rawBody(), signature)) {
            throw new WebhookVerificationException("Paystack webhook signature invalid or missing");
        }

        try {
            Map<String, Object> payload = objectMapper.readValue(request.rawBody(), Map.class);
            String event                = (String) payload.get("event");
            Map<String, Object> data    = (Map<String, Object>) payload.get("data");
            String reference            = (String) data.get("reference");
            Number amountKobo           = (Number) data.get("amount");

            BigDecimal amount = amountKobo != null
                    ? BigDecimal.valueOf(amountKobo.longValue()).divide(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            PaymentEventType type = switch (event) {
                case "charge.success"   -> PaymentEventType.PAYMENT_CONFIRMED;
                case "charge.failed"    -> PaymentEventType.PAYMENT_FAILED;
                case "refund.processed" -> PaymentEventType.REFUND_COMPLETED;
                case "transfer.success" -> PaymentEventType.PAYOUT_COMPLETED;
                case "transfer.failed"  -> PaymentEventType.PAYOUT_FAILED;
                default                 -> PaymentEventType.PAYMENT_INITIATED;
            };

            log.debug("Paystack webhook received: event={}, reference={}, type={}", event, reference, type);

            return new PaymentEvent(
                    type,
                    reference,
                    getProviderName(),
                    reference,      // Paystack uses the order reference as its transaction ID
                    amount,
                    request.rawBody(),
                    Map.of("event", event),
                    Instant.now()
            );
        } catch (WebhookVerificationException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Paystack webhook payload: " + e.getMessage(), e);
        }
    }

    @Override
    public PayoutResult payoutSeller(Order order) {
        try {
            paystackService.initiateTransfer(order);
            log.info("Paystack transfer initiated for order {}", order.getOrderNumber());
            return PayoutResult.completed("paystack-transfer-" + order.getOrderNumber());
        } catch (Exception e) {
            log.error("Paystack payout failed for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            return PayoutResult.failed(e.getMessage());
        }
    }
}
