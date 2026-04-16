package za.co.thrift.eduthrift.service.payment;

/**
 * Thrown by a {@link PaymentProvider} implementation when an inbound webhook
 * request fails signature or hash verification.
 *
 * The {@link za.co.thrift.eduthrift.controller.PaymentController} catches this
 * and returns HTTP 401 without logging a full stack trace (the warning is sufficient).
 */
public class WebhookVerificationException extends RuntimeException {

    public WebhookVerificationException(String message) {
        super(message);
    }
}
