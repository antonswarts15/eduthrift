package za.co.thrift.eduthrift.service.payment;

/**
 * Result of a payment initiation request.
 *
 * On success, {@link #redirectUrl()} contains the provider-hosted payment page
 * the buyer should be redirected to. On failure, {@link #errorMessage()} describes
 * the problem in a form safe to log (never returned to the browser as-is).
 */
public record PaymentResult(
        boolean success,
        String redirectUrl,
        String providerTransactionId,
        String errorMessage
) {
    public static PaymentResult success(String redirectUrl, String providerTransactionId) {
        return new PaymentResult(true, redirectUrl, providerTransactionId, null);
    }

    public static PaymentResult failure(String errorMessage) {
        return new PaymentResult(false, null, null, errorMessage);
    }
}
