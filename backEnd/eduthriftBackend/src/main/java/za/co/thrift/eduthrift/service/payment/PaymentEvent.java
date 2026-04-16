package za.co.thrift.eduthrift.service.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * Normalized representation of a payment lifecycle event produced by a
 * {@link PaymentProvider} adapter.
 *
 * All provider-specific webhook payloads (Paystack JSON, Ozow form params, …)
 * are translated into this single value object before any business logic runs.
 * This is the only payment event type that {@link PaymentService} knows about.
 *
 * @param type                  Normalized event type
 * @param orderNumber           Eduthrift order reference (e.g. ORD-1234567890)
 * @param providerName          Provider identifier — matches Order.PaymentMethod (e.g. PAYSTACK)
 * @param providerTransactionId The provider's own transaction / reference ID — used for idempotency
 * @param amount                Transaction amount in ZAR
 * @param rawPayload            The original raw payload as received (for audit purposes)
 * @param metadata              Any additional provider-specific key/value pairs
 * @param timestamp             When the event was received
 */
public record PaymentEvent(
        PaymentEventType type,
        String orderNumber,
        String providerName,
        String providerTransactionId,
        BigDecimal amount,
        String rawPayload,
        Map<String, String> metadata,
        Instant timestamp
) {}
