package za.co.thrift.eduthrift.service.payment;

import java.util.Collections;
import java.util.Map;

/**
 * Carrier for a raw inbound webhook request before it has been verified or parsed.
 *
 * Supports both JSON-body webhooks (Paystack, Peach, Stitch) and HTML-form-param
 * webhooks (Ozow) within a single type so the {@link PaymentProvider} interface
 * can have one method signature.
 *
 * @param rawBody    Raw request body bytes as a string (JSON for most providers)
 * @param headers    All HTTP request headers, lower-cased by Spring
 * @param formParams Form parameters, populated only for application/x-www-form-urlencoded webhooks
 */
public record WebhookRequest(
        String rawBody,
        Map<String, String> headers,
        Map<String, String> formParams
) {
    /** Factory for JSON-body webhooks (Paystack, Peach, Stitch). */
    public static WebhookRequest ofJson(String rawBody, Map<String, String> headers) {
        return new WebhookRequest(rawBody, headers, Collections.emptyMap());
    }

    /** Factory for form-param webhooks (Ozow). */
    public static WebhookRequest ofForm(Map<String, String> formParams, Map<String, String> headers) {
        return new WebhookRequest("", headers, formParams);
    }
}
