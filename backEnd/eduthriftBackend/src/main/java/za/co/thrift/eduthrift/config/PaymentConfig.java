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
 * payment.default-provider=PAYSTACK
 * payment.providers.paystack.enabled=true
 * payment.providers.ozow.enabled=true
 * payment.providers.peach.enabled=false
 * payment.providers.stitch.enabled=false
 * </pre>
 *
 * {@link za.co.thrift.eduthrift.service.payment.PaymentService} reads
 * {@link #getDefaultProvider()} when an order has no {@code paymentMethod} set.
 *
 * Individual provider beans are conditionally registered via
 * {@code @ConditionalOnProperty(name="payment.providers.<name>.enabled", havingValue="true")}
 * on each {@link za.co.thrift.eduthrift.service.payment.PaymentProvider} implementation.
 * Paystack and Ozow are always-on (no conditional) because they are live in production.
 */
@Configuration
@ConfigurationProperties(prefix = "payment")
@Data
public class PaymentConfig {

    /**
     * Name of the default provider to use when an order has no explicit payment method.
     * Must match an {@code Order.PaymentMethod} enum constant name (e.g. {@code PAYSTACK}).
     */
    private String defaultProvider = "PAYSTACK";

    /**
     * Per-provider enabled flags. The key must be lower-case (e.g. {@code paystack}, {@code ozow}).
     */
    private Map<String, ProviderConfig> providers = new HashMap<>();

    @Data
    public static class ProviderConfig {
        private boolean enabled = false;
    }
}
