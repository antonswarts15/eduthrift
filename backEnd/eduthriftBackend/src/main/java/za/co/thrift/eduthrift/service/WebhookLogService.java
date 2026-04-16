package za.co.thrift.eduthrift.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.entity.WebhookLog;
import za.co.thrift.eduthrift.repository.WebhookLogRepository;
import za.co.thrift.eduthrift.service.payment.WebhookRequest;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Persists audit records for every inbound webhook request.
 *
 * <p>Logging is done <em>before</em> signature verification so that forged,
 * replayed, or malformed requests are captured. This is the primary defence
 * record in the event of a payment dispute.
 *
 * <p>All methods use {@code REQUIRES_NEW} propagation so log writes are
 * committed independently of the caller's transaction. A rollback in the
 * payment processing flow will not remove the webhook log entry.
 *
 * <h2>Sensitive header filtering</h2>
 * <p>Only non-sensitive headers are stored. Authorization, Cookie, and other
 * credential headers are stripped before persistence.
 */
@Service
public class WebhookLogService {

    private static final Logger log = LoggerFactory.getLogger(WebhookLogService.class);

    private static final Set<String> SENSITIVE_HEADERS = Set.of(
            "authorization", "cookie", "set-cookie", "x-api-key",
            "x-auth-token", "proxy-authorization"
    );

    private final WebhookLogRepository repo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebhookLogService(WebhookLogRepository repo) {
        this.repo = repo;
    }

    /**
     * Persist an incoming webhook request before any processing.
     *
     * @return the saved log entry's ID — pass to subsequent update methods
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long logIncoming(String provider, String endpointPath, WebhookRequest request) {
        String rawHeaders = serializeHeaders(request.headers());
        String rawPayload = request.formParams().isEmpty()
                ? request.rawBody()
                : request.formParams().toString();

        WebhookLog entry = WebhookLog.incoming(provider, endpointPath, rawPayload, rawHeaders);
        repo.save(entry);
        log.debug("Webhook logged: provider={}, logId={}, endpoint={}", provider, entry.getId(), endpointPath);
        return entry.getId();
    }

    /**
     * Mark the webhook as signature-verified and record the associated order number.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markVerified(Long logId, String orderNumber) {
        repo.findById(logId).ifPresent(entry -> {
            entry.setVerified(true);
            entry.setOrderNumber(orderNumber);
            repo.save(entry);
        });
    }

    /**
     * Mark the webhook as successfully processed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markProcessed(Long logId) {
        repo.findById(logId).ifPresent(entry -> {
            entry.setProcessed(true);
            entry.setResolvedAt(LocalDateTime.now());
            repo.save(entry);
        });
    }

    /**
     * Mark the webhook as failed (signature invalid, processing error, order not found, etc.)
     * and record the reason.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(Long logId, String reason) {
        repo.findById(logId).ifPresent(entry -> {
            // Truncate to fit column length
            String truncated = reason != null && reason.length() > 490
                    ? reason.substring(0, 490) + "..."
                    : reason;
            entry.setFailureReason(truncated);
            entry.setResolvedAt(LocalDateTime.now());
            repo.save(entry);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String serializeHeaders(Map<String, String> headers) {
        if (headers == null || headers.isEmpty()) return "{}";
        Map<String, String> safe = headers.entrySet().stream()
                .filter(e -> !SENSITIVE_HEADERS.contains(e.getKey().toLowerCase()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        try {
            return objectMapper.writeValueAsString(safe);
        } catch (Exception e) {
            return "{\"error\":\"could not serialize headers\"}";
        }
    }
}
