package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Double-entry financial ledger.
 *
 * <p>Every financial event in the system produces one or more pairs of entries
 * where the sum of all DEBITs equals the sum of all CREDITs for that event.
 * Records are append-only — never updated or deleted.
 *
 * <h2>Account types and what they represent</h2>
 * <ul>
 *   <li>{@code BUYER}    — money the buyer has paid into the system (DEBIT = buyer paid)</li>
 *   <li>{@code ESCROW}   — funds currently held in escrow (CREDIT = received, DEBIT = released)</li>
 *   <li>{@code SELLER}   — money accrued and owed to a seller (CREDIT = accrued, DEBIT = paid out)</li>
 *   <li>{@code PLATFORM} — Eduthrift's revenue (CREDIT = earned)</li>
 *   <li>{@code SHIPPING} — shipping costs collected from buyers</li>
 *   <li>{@code EXTERNAL} — money that has left the system to an external bank account</li>
 * </ul>
 *
 * <h2>Standard event flows</h2>
 * <pre>
 * Payment received (buyer pays R500: R450 item + R50 protection fee + R30 shipping):
 *   DEBIT  BUYER    R530   "Payment received"
 *   CREDIT ESCROW   R500   "Escrow hold" (item + protection fee)
 *   CREDIT SHIPPING R30    "Shipping collected"
 *
 * Escrow release (delivery confirmed):
 *   DEBIT  ESCROW   R500   "Escrow released"
 *   CREDIT SELLER   R450   "Seller payout accrued"
 *   CREDIT PLATFORM R50    "Platform fee earned"
 *
 * Payout (actual bank transfer to seller):
 *   DEBIT  SELLER   R450   "Payout executed"
 *   CREDIT EXTERNAL R450   "Funds transferred to seller bank"
 *
 * Refund (order disputed in buyer's favour):
 *   DEBIT  ESCROW   R500   "Refund released"
 *   CREDIT BUYER    R500   "Buyer refunded"
 * </pre>
 *
 * <h2>Useful balance queries</h2>
 * <ul>
 *   <li>Money owed to all sellers: SUM(amount) WHERE account=SELLER AND type=CREDIT
 *       MINUS SUM(amount) WHERE account=SELLER AND type=DEBIT</li>
 *   <li>Platform revenue this month: SUM(amount) WHERE account=PLATFORM AND type=CREDIT
 *       AND created_at >= first day of month</li>
 *   <li>Current escrow balance: SUM(CREDIT) - SUM(DEBIT) WHERE account=ESCROW</li>
 * </ul>
 */
@Entity
@Table(
        name = "ledger_entries",
        indexes = {
                @Index(name = "idx_le_order_id",   columnList = "order_id"),
                @Index(name = "idx_le_user_id",    columnList = "user_id"),
                @Index(name = "idx_le_account",    columnList = "account_type, entry_type"),
                @Index(name = "idx_le_created_at", columnList = "created_at")
        }
)
public class LedgerEntry {

    public enum AccountType {
        BUYER, ESCROW, SELLER, PLATFORM, SHIPPING, EXTERNAL
    }

    public enum EntryType {
        DEBIT, CREDIT
    }

    public enum ReferenceType {
        PAYMENT_RECEIVED,
        ESCROW_HOLD,
        ESCROW_RELEASE,
        PAYOUT,
        REFUND,
        PLATFORM_FEE,
        SHIPPING_COLLECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * The user this entry relates to — buyer or seller ID.
     * Null for system accounts (ESCROW, PLATFORM, SHIPPING, EXTERNAL).
     */
    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 10)
    private EntryType entryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 15)
    private AccountType accountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 25)
    private ReferenceType referenceType;

    @Column(length = 200)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Factory — used by LedgerService to keep construction in one place
    // ─────────────────────────────────────────────────────────────────────────

    public static LedgerEntry of(Order order,
                                  Long userId,
                                  EntryType entryType,
                                  AccountType accountType,
                                  BigDecimal amount,
                                  ReferenceType referenceType,
                                  String description) {
        LedgerEntry e = new LedgerEntry();
        e.order         = order;
        e.userId        = userId;
        e.entryType     = entryType;
        e.accountType   = accountType;
        e.amount        = amount;
        e.referenceType = referenceType;
        e.description   = description;
        return e;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters (no setters — append-only)
    // ─────────────────────────────────────────────────────────────────────────

    public Long getId()                { return id; }
    public Order getOrder()            { return order; }
    public Long getUserId()            { return userId; }
    public EntryType getEntryType()    { return entryType; }
    public AccountType getAccountType(){ return accountType; }
    public BigDecimal getAmount()      { return amount; }
    public ReferenceType getReferenceType() { return referenceType; }
    public String getDescription()     { return description; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
}
