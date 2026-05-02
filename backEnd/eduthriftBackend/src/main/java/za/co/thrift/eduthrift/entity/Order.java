package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "item_price", nullable = false)
    private BigDecimal itemPrice;

    @Column(name = "shipping_cost", nullable = false)
    private BigDecimal shippingCost;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING_PAYMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "escrow_status")
    @Enumerated(EnumType.STRING)
    private EscrowStatus escrowStatus = EscrowStatus.PENDING;

    @Column(name = "escrow_amount")
    private BigDecimal escrowAmount;

    @Column(name = "buyer_protection_fee")
    private BigDecimal buyerProtectionFee;

    @Column(name = "platform_fee")
    private BigDecimal platformFee;

    @Column(name = "payment_processing_fee")
    private BigDecimal paymentProcessingFee;

    @Column(name = "seller_payout")
    private BigDecimal sellerPayout;

    @Column(name = "payout_status")
    @Enumerated(EnumType.STRING)
    private PayoutStatus payoutStatus = PayoutStatus.PENDING;

    @Column(name = "payout_date")
    private LocalDateTime payoutDate;

    /** Number of payout attempts made so far (0 = not yet attempted). */
    @Column(name = "payout_attempts", nullable = false)
    private int payoutAttempts = 0;

    /** Timestamp of the most recent payout attempt — used to enforce retry backoff. */
    @Column(name = "last_payout_attempt_at")
    private LocalDateTime lastPayoutAttemptAt;

    /** Human-readable reason for the last payout failure — shown in admin panel. */
    @Column(name = "payout_failure_reason", length = 500)
    private String payoutFailureReason;

    @Column(name = "tradesafe_transaction_id")
    private String tradeSafeTransactionId;

    @Column(name = "tradesafe_allocation_id")
    private String tradeSafeAllocationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "payout_scheduled_at")
    private LocalDateTime payoutScheduledAt;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "pickup_point")
    private String pickupPoint;

    // The TCG locker ID the buyer selected for delivery (e.g. "CG01")
    @Column(name = "delivery_locker_id")
    private String deliveryLockerId;

    // TCG service level code chosen at checkout (e.g. "ECO")
    @Column(name = "service_level_code")
    private String serviceLevelCode;

    // TCG shipment ID returned after shipment creation
    @Column(name = "tcg_shipment_id")
    private String tcgShipmentId;

    @Column(name = "delivery_confirmed")
    private Boolean deliveryConfirmed = false;

    @Column(name = "delivery_confirmed_date")
    private LocalDateTime deliveryConfirmedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "dispute_status")
    private DisputeStatus disputeStatus = DisputeStatus.NONE;

    @Column(name = "dispute_reason", length = 1000)
    private String disputeReason;

    @Column(name = "dispute_raised_at")
    private LocalDateTime disputeRaisedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderNumber == null) {
            orderNumber = "ORD-" + System.currentTimeMillis();
        }
        calculateFees();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private void calculateFees() {
        if (itemPrice != null && quantity != null) {
            BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(quantity));

            // Vinted model: seller pays nothing, buyer pays a protection fee
            // Protection fee: 10% of item price, min R5, max R50
            BigDecimal rawFee = itemTotal.multiply(BigDecimal.valueOf(0.10))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            buyerProtectionFee = rawFee
                    .max(BigDecimal.valueOf(5.00))
                    .min(BigDecimal.valueOf(50.00));

            platformFee = buyerProtectionFee;       // platform earns the protection fee
            paymentProcessingFee = BigDecimal.ZERO; // absorbed in platform fee
            sellerPayout = itemTotal;               // seller gets full item price

            // Total buyer pays = item + protection fee + shipping (shipping added at checkout)
            escrowAmount = itemTotal.add(buyerProtectionFee);
        }
    }

    public enum OrderStatus {
        PENDING_PAYMENT,
        PAYMENT_CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        COMPLETED,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentStatus {
        PENDING,
        AUTHORIZED,
        CAPTURED,
        FAILED,
        REFUNDED
    }

    public enum EscrowStatus {
        PENDING,
        HELD,
        RELEASED_TO_SELLER,
        REFUNDED_TO_BUYER
    }

    public enum PaymentMethod {
        TRADESAFE   // instant EFT via TradeSafe licensed escrow — funds held by TradeSafe, not Eduthrift
    }

    public enum PayoutStatus {
        PENDING,
        PROCESSING,       // transfer initiated but not yet confirmed
        COMPLETED,
        FAILED,
        MANUAL_REQUIRED   // provider does not support auto-payouts (e.g. Ozow); admin must manually EFT seller
    }

    public enum DisputeStatus {
        NONE,
        OPEN,
        RESOLVED_REFUND,
        RESOLVED_RELEASE
    }
}
