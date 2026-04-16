package za.co.thrift.eduthrift.service.payment;

/**
 * Canonical set of payment lifecycle events understood by the system.
 *
 * Every provider adapter (Paystack, Ozow, Peach, Stitch …) must translate
 * its provider-specific event names into one of these values before passing
 * the event to {@link PaymentService}.
 */
public enum PaymentEventType {
    PAYMENT_INITIATED,
    PAYMENT_CONFIRMED,
    PAYMENT_FAILED,
    PAYMENT_CANCELLED,
    REFUND_INITIATED,
    REFUND_COMPLETED,
    PAYOUT_INITIATED,
    PAYOUT_COMPLETED,
    PAYOUT_FAILED
}
