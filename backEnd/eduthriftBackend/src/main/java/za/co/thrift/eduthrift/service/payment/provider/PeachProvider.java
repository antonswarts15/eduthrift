package za.co.thrift.eduthrift.service.payment.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.service.payment.*;

/**
 * Stub {@link PaymentProvider} for Peach Payments.
 *
 * <p>This bean is only registered when
 * {@code payment.providers.peach.enabled=true} — it will never activate in
 * production until the integration is complete.
 *
 * <h2>Implementation TODO</h2>
 * <ol>
 *   <li>Add Peach API credentials to application.properties:
 *       {@code peach.entity.id}, {@code peach.access.token}, {@code peach.webhook.secret}</li>
 *   <li>Implement {@link #initiatePayment} using Peach Payments Checkout API
 *       (POST /v1/checkouts → returns a checkout ID → redirect to hosted page)</li>
 *   <li>Implement {@link #parseWebhook} with HMAC-SHA256 verification using
 *       the {@code X-Initialization-Vector}, {@code X-Authentication-Tag}, and
 *       {@code authentication.secret} from the Peach webhook documentation</li>
 *   <li>Implement {@link #payoutSeller} using Peach Disbursements API</li>
 *   <li>Add endpoint {@code POST /payments/peach/webhook} in
 *       {@link za.co.thrift.eduthrift.controller.PaymentController} (already stubbed)</li>
 *   <li>Add {@code Order.PaymentMethod.PEACH} checkout path in frontend CheckoutPage.tsx</li>
 * </ol>
 *
 * <h2>Peach Payments specifics (for implementor)</h2>
 * <ul>
 *   <li>Base URL: {@code https://oppwa.com} (sandbox: {@code https://eu-test.oppwa.com})</li>
 *   <li>Webhook event types: {@code PAYMENT.REGISTRATION.CREATED},
 *       {@code PAYMENT.CAPTURE.SUCCESSFUL}, {@code PAYMENT.REFUND.SUCCESSFUL}</li>
 *   <li>Amounts in ZAR with 2 decimal places as a string (e.g. {@code "150.00"})</li>
 * </ul>
 */
@Component
@ConditionalOnProperty(name = "payment.providers.peach.enabled", havingValue = "true")
public class PeachProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(PeachProvider.class);

    @Override
    public String getProviderName() {
        return "PEACH";
    }

    @Override
    public boolean supportsPayouts() {
        return true;
    }

    @Override
    public PaymentResult initiatePayment(Order order) {
        throw new UnsupportedOperationException(
                "Peach Payments integration is not yet implemented. "
                        + "See PeachProvider Javadoc for implementation guide.");
    }

    @Override
    public PaymentEvent parseWebhook(WebhookRequest request) {
        throw new UnsupportedOperationException(
                "Peach Payments webhook parsing is not yet implemented.");
    }

    @Override
    public PayoutResult payoutSeller(Order order) {
        throw new UnsupportedOperationException(
                "Peach Payments disbursements are not yet implemented.");
    }
}
