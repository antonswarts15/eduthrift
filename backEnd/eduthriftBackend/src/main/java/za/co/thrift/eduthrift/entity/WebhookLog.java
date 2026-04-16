package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Audit log of every inbound webhook request from a payment provider.
 *
 * <p>A row is written for every incoming webhook <em>before</em> signature
 * verification, so even forged or malformed requests are captured.
 * This provides a complete defence trail for disputes and compliance audits.
 *
 * <p>Unlike {@link PaymentTransaction} (which records processed events),
 * this table records the raw HTTP request — including requests that failed
 * verification and were never processed.
 *
 * <p>Records are mutable: {@link #verified} and {@link #processed} are updated
 * as the request moves through the pipeline.
 */
@Entity
@Table(
        name = "webhook_logs",
        indexes = {
                @Index(name = "idx_wl_provider",     columnList = "provider"),
                @Index(name = "idx_wl_order_number", columnList = "order_number"),
                @Index(name = "idx_wl_created_at",   columnList = "created_at"),
                @Index(name = "idx_wl_verified",     columnList = "verified")
        }
)
public class WebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Payment provider that sent this webhook (e.g. PAYSTACK, OZOW). */
    @Column(nullable = false, length = 20)
    private String provider;

    /** The endpoint path that received the request (e.g. /payments/paystack/webhook). */
    @Column(name = "endpoint_path", length = 100)
    private String endpointPath;

    /** Raw request body as received. Stored for dispute/debug purposes. */
    @Column(name = "raw_payload", columnDefinition = "MEDIUMTEXT")
    private String rawPayload;

    /**
     * Serialized request headers (JSON string).
     * Sensitive headers (Authorization, Cookie) are omitted by WebhookLogService.
     */
    @Column(name = "raw_headers", columnDefinition = "TEXT")
    private String rawHeaders;

    /** Eduthrift order number extracted from the payload, if successfully parsed. */
    @Column(name = "order_number", length = 50)
    private String orderNumber;

    /** Whether the provider's signature/hash was successfully verified. */
    @Column(nullable = false)
    private boolean verified = false;

    /** Whether the normalized event was successfully processed by PaymentService. */
    @Column(nullable = false)
    private boolean processed = false;

    /** Human-readable reason if verification or processing failed. */
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static WebhookLog incoming(String provider, String endpointPath,
                                       String rawPayload, String rawHeaders) {
        WebhookLog log = new WebhookLog();
        log.provider     = provider;
        log.endpointPath = endpointPath;
        log.rawPayload   = rawPayload;
        log.rawHeaders   = rawHeaders;
        return log;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters / setters (mutable — status is updated during processing)
    // ─────────────────────────────────────────────────────────────────────────

    public Long getId()              { return id; }
    public String getProvider()      { return provider; }
    public String getEndpointPath()  { return endpointPath; }
    public String getRawPayload()    { return rawPayload; }
    public String getRawHeaders()    { return rawHeaders; }
    public String getOrderNumber()   { return orderNumber; }
    public boolean isVerified()      { return verified; }
    public boolean isProcessed()     { return processed; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }

    public void setOrderNumber(String orderNumber)     { this.orderNumber = orderNumber; }
    public void setVerified(boolean verified)          { this.verified = verified; }
    public void setProcessed(boolean processed)        { this.processed = processed; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public void setResolvedAt(LocalDateTime resolvedAt){ this.resolvedAt = resolvedAt; }
}
