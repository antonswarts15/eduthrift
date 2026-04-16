package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.thrift.eduthrift.entity.WebhookLog;

import java.time.LocalDateTime;
import java.util.List;

public interface WebhookLogRepository extends JpaRepository<WebhookLog, Long> {

    /** Unverified requests in the last N minutes — use to detect signature-failure attacks. */
    List<WebhookLog> findByProviderAndVerifiedFalseAndCreatedAtAfter(
            String provider, LocalDateTime since);

    /** All webhook logs for a specific order — use for dispute resolution. */
    List<WebhookLog> findByOrderNumberOrderByCreatedAtAsc(String orderNumber);

    /** Unprocessed but verified webhooks — use to find events that were received but not acted on. */
    List<WebhookLog> findByVerifiedTrueAndProcessedFalseAndCreatedAtBefore(LocalDateTime cutoff);
}
