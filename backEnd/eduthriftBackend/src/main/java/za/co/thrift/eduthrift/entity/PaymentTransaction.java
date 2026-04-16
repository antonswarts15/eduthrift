package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Append-only audit log of every payment lifecycle event received from external providers.
 *
 * <p>Records are never updated — a new row is written for every event (initiation,
 * confirmation, payout, refund, …). This provides a complete, immutable history
 * that supports auditing, dispute resolution, and idempotency checks.
 *
 * <p>Idempotency: before processing a webhook, {@link za.co.thrift.eduthrift.service.payment.PaymentService}
 * checks whether a row already exists with the same {@code provider} + {@code providerTransactionId}
 * + {@code eventType} triple. If it does, the event is acknowledged but not re-processed.
 */
@Entity
@Table(
        name = "payment_transactions",
        indexes = {
                @Index(name = "idx_pt_order_id",     columnList = "order_id"),
                @Index(name = "idx_pt_provider_tx",  columnList = "provider, provider_transaction_id"),
                @Index(name = "idx_pt_idempotency",  columnList = "provider, provider_transaction_id, event_type")
        }
)
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** Provider name — matches {@code Order.PaymentMethod} constant (e.g. PAYSTACK, OZOW). */
    @Column(nullable = false, length = 20)
    private String provider;

    /** Provider's own transaction reference — used for idempotency and reconciliation. */
    @Column(name = "provider_transaction_id", length = 255)
    private String providerTransactionId;

    /** Normalized event type name from {@link za.co.thrift.eduthrift.service.payment.PaymentEventType}. */
    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    /** Human-readable status summary for the audit record (e.g. INITIATED, CAPTURED, FAILED). */
    @Column(length = 30)
    private String status;

    /** Full raw payload as received from the provider. Stored for dispute/debug purposes. */
    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static PaymentTransaction of(Order order,
                                         String provider,
                                         String providerTransactionId,
                                         String eventType,
                                         BigDecimal amount,
                                         String status,
                                         String rawPayload) {
        PaymentTransaction t = new PaymentTransaction();
        t.order                  = order;
        t.provider               = provider;
        t.providerTransactionId  = providerTransactionId;
        t.eventType              = eventType;
        t.amount                 = amount;
        t.status                 = status;
        t.rawPayload             = rawPayload;
        return t;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters (no setters — this entity is append-only)
    // ─────────────────────────────────────────────────────────────────────────

    public Long getId()                      { return id; }
    public Order getOrder()                  { return order; }
    public String getProvider()              { return provider; }
    public String getProviderTransactionId() { return providerTransactionId; }
    public String getEventType()             { return eventType; }
    public BigDecimal getAmount()            { return amount; }
    public String getStatus()                { return status; }
    public String getRawPayload()            { return rawPayload; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
}
