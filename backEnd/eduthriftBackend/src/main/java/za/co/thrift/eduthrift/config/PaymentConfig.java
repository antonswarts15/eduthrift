package za.co.thrift.eduthrift.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Strongly-typed binding for all {@code payment.*} properties.
 *
 * Example application.properties:
 * <pre>
 * payment.default-provider=TRADESAFE
 * </pre>
 *
 * {@link za.co.thrift.eduthrift.service.payment.PaymentService} reads
 * {@link #getDefaultProvider()} when an order has no {@code paymentMethod} set.
 */
@Configuration
@ConfigurationProperties(prefix = "payment")
@Data
public class PaymentConfig {

    /**
     * Name of the default provider to use when an order has no explicit payment method.
     * Must match an {@code Order.PaymentMethod} enum constant name.
     */
    private String defaultProvider = "TRADESAFE";

    /**
     * Per-provider enabled flags. The key must be lower-case (e.g. {@code paystack}, {@code ozow}).
     */
    private Map<String, ProviderConfig> providers = new HashMap<>();

    @Data
    public static class ProviderConfig {
        private boolean enabled = false;
    }
}
