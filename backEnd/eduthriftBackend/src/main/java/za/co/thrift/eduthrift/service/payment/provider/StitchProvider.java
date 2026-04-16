package za.co.thrift.eduthrift.service.payment.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.service.payment.*;

/**
 * Stub {@link PaymentProvider} for Stitch (Pay by Bank / instant EFT).
 *
 * <p>This bean is only registered when
 * {@code payment.providers.stitch.enabled=true}.
 *
 * <h2>Implementation TODO</h2>
 * <ol>
 *   <li>Add credentials to application.properties:
 *       {@code stitch.client.id}, {@code stitch.client.secret},
 *       {@code stitch.webhook.secret}</li>
 *   <li>Implement OAuth 2.0 client credentials token acquisition</li>
 *   <li>Implement {@link #initiatePayment} using the Stitch PaymentInitiation
 *       GraphQL mutation → returns a redirect URL</li>
 *   <li>Implement {@link #parseWebhook} verifying the JWT webhook signature
 *       using Stitch's public JWKS endpoint</li>
 *   <li>Implement {@link #payoutSeller} using Stitch Disbursements (LinkPay)</li>
 *   <li>Add endpoint {@code POST /payments/stitch/webhook} in
 *       {@link za.co.thrift.eduthrift.controller.PaymentController}</li>
 * </ol>
 *
 * <h2>Stitch specifics (for implementor)</h2>
 * <ul>
 *   <li>API: GraphQL at {@code https://api.stitch.money/graphql}</li>
 *   <li>Auth: OAuth 2.0 client credentials + PKCE for user flows</li>
 *   <li>Webhooks are signed JWTs — verify against
 *       {@code https://api.stitch.money/.well-known/jwks.json}</li>
 *   <li>Amounts in minor units (cents) as integers</li>
 * </ul>
 */
@Component
@ConditionalOnProperty(name = "payment.providers.stitch.enabled", havingValue = "true")
public class StitchProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(StitchProvider.class);

    @Override
    public String getProviderName() {
        return "STITCH";
    }

    @Override
    public boolean supportsPayouts() {
        return true;
    }

    @Override
    public PaymentResult initiatePayment(Order order) {
        throw new UnsupportedOperationException(
                "Stitch integration is not yet implemented. "
                        + "See StitchProvider Javadoc for implementation guide.");
    }

    @Override
    public PaymentEvent parseWebhook(WebhookRequest request) {
        throw new UnsupportedOperationException(
                "Stitch webhook parsing is not yet implemented.");
    }

    @Override
    public PayoutResult payoutSeller(Order order) {
        throw new UnsupportedOperationException(
                "Stitch disbursements are not yet implemented.");
    }
}
