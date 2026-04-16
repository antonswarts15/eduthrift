package za.co.thrift.eduthrift.service.payment;

import za.co.thrift.eduthrift.entity.Order;

import java.math.BigDecimal;

/**
 * Abstraction over a payment gateway or escrow provider.
 *
 * <h2>Contract</h2>
 * <ul>
 *   <li>Each implementation must be a Spring bean ({@code @Component} or {@code @Service})
 *       so that {@link PaymentService} and {@link WebhookEventNormalizer} can auto-discover
 *       all registered providers via {@code List<PaymentProvider>} injection.</li>
 *   <li>{@link #getProviderName()} must return a value that exactly matches one of the
 *       {@code Order.PaymentMethod} enum constant names (case-insensitive comparison is
 *       performed at lookup time).</li>
 *   <li>{@link #parseWebhook(WebhookRequest)} must throw {@link WebhookVerificationException}
 *       if the signature or hash is invalid — it must never silently accept forged requests.</li>
 * </ul>
 *
 * <h2>Adding a new provider</h2>
 * <ol>
 *   <li>Create a new class in {@code service.payment.provider} implementing this interface.</li>
 *   <li>Annotate it with {@code @Component} and optionally
 *       {@code @ConditionalOnProperty(name = "payment.providers.<name>.enabled", havingValue = "true")}.</li>
 *   <li>Add the corresponding constant to {@code Order.PaymentMethod}.</li>
 *   <li>Add webhook endpoint(s) to {@link za.co.thrift.eduthrift.controller.PaymentController}.</li>
 *   <li>Set {@code payment.providers.<name>.enabled=true} in application.properties when ready.</li>
 * </ol>
 */
public interface PaymentProvider {

    /**
     * Unique provider identifier. Must match an {@code Order.PaymentMethod} enum constant name.
     * Examples: {@code "PAYSTACK"}, {@code "OZOW"}, {@code "PEACH"}, {@code "STITCH"}.
     */
    String getProviderName();

    /**
     * Returns {@code true} if this provider supports programmatic bank transfers to sellers.
     * Providers returning {@code false} will cause the order's {@code payout_status} to be
     * set to {@code MANUAL_REQUIRED} by {@link PaymentService}.
     */
    boolean supportsPayouts();

    /**
     * Initiate a payment for the given order.
     *
     * @return {@link PaymentResult} containing a redirect URL on success, or an error message.
     */
    PaymentResult initiatePayment(Order order);

    /**
     * Verify the incoming webhook request's authenticity and translate it into a normalized
     * {@link PaymentEvent}.
     *
     * <p>Implementations must:
     * <ol>
     *   <li>Verify the cryptographic signature/hash of the request.</li>
     *   <li>Parse the provider-specific payload.</li>
     *   <li>Map the provider event name to a {@link PaymentEventType}.</li>
     * </ol>
     *
     * @throws WebhookVerificationException if the signature is missing or invalid.
     */
    PaymentEvent parseWebhook(WebhookRequest request);

    /**
     * Initiate a payout to the seller's registered bank account after escrow is released.
     *
     * <p>Implementations for providers that do not support programmatic payouts must
     * return {@link PayoutResult#manual(String)} rather than throwing an exception,
     * so the order can be correctly flagged for admin attention.
     */
    PayoutResult payoutSeller(Order order);

    /**
     * Initiate a refund for a previously captured payment.
     *
     * <p>Providers that do not support programmatic refunds may leave this as the default
     * implementation (throws {@link UnsupportedOperationException}).
     */
    default PaymentResult refundPayment(String providerTransactionId, BigDecimal amount) {
        throw new UnsupportedOperationException(
                getProviderName() + " does not support programmatic refunds via this integration");
    }
}
