package za.co.thrift.eduthrift.service.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Routes inbound webhook requests to the correct {@link PaymentProvider} adapter
 * for cryptographic verification and payload normalization.
 *
 * <p>All registered {@link PaymentProvider} beans in the Spring context are
 * auto-discovered via {@code List<PaymentProvider>} constructor injection. Adding
 * a new provider bean automatically makes it available here — no manual wiring needed.
 *
 * <p>This class is intentionally thin: it only routes requests and delegates all
 * provider-specific logic to the correct adapter. Business logic lives in
 * {@link PaymentService}.
 */
@Service
public class WebhookEventNormalizer {

    private static final Logger log = LoggerFactory.getLogger(WebhookEventNormalizer.class);

    private final Map<String, PaymentProvider> providersByName;

    public WebhookEventNormalizer(List<PaymentProvider> providers) {
        this.providersByName = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        Function.identity()
                ));
        log.info("WebhookEventNormalizer: registered providers — {}", providersByName.keySet());
    }

    /**
     * Verify the signature/hash of an incoming webhook and translate its payload
     * into a normalized {@link PaymentEvent}.
     *
     * @param providerName  Provider identifier, case-insensitive (e.g. "PAYSTACK", "ozow")
     * @param request       Raw webhook request including headers and body
     * @return              Normalized {@link PaymentEvent} ready for {@link PaymentService}
     * @throws WebhookVerificationException if the provider rejects the signature
     * @throws IllegalArgumentException     if no provider is registered for {@code providerName}
     */
    public PaymentEvent normalize(String providerName, WebhookRequest request) {
        PaymentProvider provider = providersByName.get(providerName.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException(
                    "No PaymentProvider registered for '" + providerName + "'. "
                            + "Registered: " + providersByName.keySet());
        }
        return provider.parseWebhook(request);
    }
}
