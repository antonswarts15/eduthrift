package za.co.thrift.eduthrift.service.payment.provider;

import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.service.payment.*;

/**
 * PaymentProvider adapter for TradeSafe escrow.
 *
 * Payment initiation and webhook callbacks are handled directly by
 * TradeSafeController, which has the full business logic (user token creation,
 * shipment trigger, FCM notifications). This adapter exists solely so that
 * PaymentService and WebhookEventNormalizer can resolve the TRADESAFE provider
 * without throwing — for example when EscrowService.releaseToSeller() is called
 * via dispute resolution or the auto-release scheduler.
 *
 * Payout: TradeSafe releases funds to the seller automatically when the buyer
 * accepts delivery (COMPLETED webhook). payoutSeller() returns MANUAL_REQUIRED
 * as a signal that no programmatic transfer is needed from our side.
 */
@Component
public class TradeSafeProvider implements PaymentProvider {

    @Override
    public String getProviderName() {
        return "TRADESAFE";
    }

    @Override
    public boolean supportsPayouts() {
        return false;
    }

    @Override
    public PaymentResult initiatePayment(Order order) {
        throw new UnsupportedOperationException(
                "TradeSafe payment initiation is handled by TradeSafeController, not PaymentService");
    }

    @Override
    public PaymentEvent parseWebhook(WebhookRequest request) {
        throw new UnsupportedOperationException(
                "TradeSafe webhooks are handled by TradeSafeController callback endpoint, not PaymentController");
    }

    @Override
    public PayoutResult payoutSeller(Order order) {
        // TradeSafe releases funds to the seller automatically when delivery is accepted.
        // If this is called (e.g. via dispute resolution), flag it for admin awareness.
        return PayoutResult.manual(
                "TradeSafe escrow: seller payout is handled automatically by TradeSafe upon delivery acceptance. "
                        + "No action required for order " + order.getOrderNumber());
    }
}
