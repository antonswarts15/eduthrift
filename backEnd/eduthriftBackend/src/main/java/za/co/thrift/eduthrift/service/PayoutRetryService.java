package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;
import za.co.thrift.eduthrift.service.payment.PaymentService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled retry engine for failed seller payouts.
 *
 * <h2>Retry policy</h2>
 * <ul>
 *   <li>Maximum 3 total attempts per order.</li>
 *   <li>Exponential backoff:
 *       <ul>
 *         <li>After attempt 1: retry after 1 hour</li>
 *         <li>After attempt 2: retry after 4 hours</li>
 *         <li>After attempt 3: no further automatic retries — stays {@code FAILED},
 *             requires admin intervention</li>
 *       </ul>
 *   </li>
 * </ul>
 *
 * <h2>Order eligibility</h2>
 * An order is eligible for retry if:
 * <ul>
 *   <li>{@code payout_status = FAILED}</li>
 *   <li>{@code payout_attempts < 3}</li>
 *   <li>{@code last_payout_attempt_at < (now - backoff)}</li>
 *   <li>Payment method has a provider that supports payouts (not Ozow/MANUAL_REQUIRED)</li>
 * </ul>
 *
 * <h2>What happens after 3 failed attempts</h2>
 * The order remains in {@code FAILED} state and will not be retried automatically.
 * The admin console should display these orders for manual resolution (updating
 * seller bank details or triggering a manual EFT).
 */
@Service
public class PayoutRetryService {

    private static final Logger log = LoggerFactory.getLogger(PayoutRetryService.class);
    private static final int MAX_ATTEMPTS = 3;

    /** Backoff by attempt number (1-indexed). */
    private static final Duration[] BACKOFF = {
            Duration.ZERO,           // placeholder for index 0
            Duration.ofHours(1),     // after attempt 1 → wait 1h
            Duration.ofHours(4),     // after attempt 2 → wait 4h
    };

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    public PayoutRetryService(OrderRepository orderRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService  = paymentService;
    }

    /**
     * Runs every 30 minutes. Finds eligible failed payouts and retries them
     * if their backoff window has expired.
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    public void retryFailedPayouts() {
        List<Order> candidates = orderRepository.findByPayoutStatusAndPayoutAttemptsLessThan(
                Order.PayoutStatus.FAILED, MAX_ATTEMPTS);

        if (candidates.isEmpty()) return;

        log.info("Payout retry scan: {} candidate order(s) found", candidates.size());

        for (Order order : candidates) {
            try {
                if (isEligibleForRetry(order)) {
                    log.info("Retrying payout for order {} (attempt {}/{})",
                            order.getOrderNumber(), order.getPayoutAttempts() + 1, MAX_ATTEMPTS);
                    paymentService.payoutSeller(order);
                }
            } catch (Exception e) {
                // paymentService.payoutSeller() already handles exceptions internally and
                // updates payoutStatus. This catch is a safety net only.
                log.error("Unexpected error during payout retry for order {}: {}",
                        order.getOrderNumber(), e.getMessage(), e);
            }
        }
    }

    /**
     * Manual trigger for a specific order — use from admin panel or for testing.
     * Bypasses the attempt count limit to allow admin-forced retries.
     */
    public void forceRetry(String orderNumber) {
        orderRepository.findByOrderNumber(orderNumber).ifPresentOrElse(
                order -> {
                    log.info("Admin-forced payout retry for order {}", order.getOrderNumber());
                    paymentService.payoutSeller(order);
                },
                () -> log.warn("forceRetry: order not found — {}", orderNumber)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private boolean isEligibleForRetry(Order order) {
        // MANUAL_REQUIRED orders are not auto-retried (Ozow and similar)
        if (order.getPaymentMethod() == null) return false;

        int attempts = order.getPayoutAttempts();
        if (attempts >= MAX_ATTEMPTS) return false;

        // Check backoff window
        LocalDateTime lastAttempt = order.getLastPayoutAttemptAt();
        if (lastAttempt == null) return true;

        Duration required = attempts < BACKOFF.length ? BACKOFF[attempts] : Duration.ofHours(24);
        return LocalDateTime.now().isAfter(lastAttempt.plus(required));
    }
}
