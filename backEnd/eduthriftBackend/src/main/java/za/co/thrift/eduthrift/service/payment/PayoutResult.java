package za.co.thrift.eduthrift.service.payment;

/**
 * Result of a seller payout attempt.
 *
 * <p>Three possible outcomes:
 * <ol>
 *   <li>{@link #completed(String)} — provider accepted the transfer request.</li>
 *   <li>{@link #manual(String)} — provider does not support programmatic transfers
 *       (e.g. Ozow). The order's {@code payout_status} will be set to
 *       {@code MANUAL_REQUIRED} for admin intervention.</li>
 *   <li>{@link #failed(String)} — provider returned an error. Admin should
 *       retry or intervene.</li>
 * </ol>
 */
public record PayoutResult(
        boolean success,
        boolean requiresManualProcessing,
        String providerReference,
        String errorMessage
) {
    public static PayoutResult completed(String providerReference) {
        return new PayoutResult(true, false, providerReference, null);
    }

    public static PayoutResult manual(String reason) {
        return new PayoutResult(false, true, null, reason);
    }

    public static PayoutResult failed(String errorMessage) {
        return new PayoutResult(false, false, null, errorMessage);
    }
}
