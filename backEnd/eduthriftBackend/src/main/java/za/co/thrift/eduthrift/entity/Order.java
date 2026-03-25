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

    @Column(name = "tradesafe_transaction_id")
    private String tradeSafeTransactionId;

    @Column(name = "tradesafe_allocation_id")
    private String tradeSafeAllocationId;

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
        if (totalAmount != null) {
            platformFee = totalAmount.multiply(BigDecimal.valueOf(0.10));
            paymentProcessingFee = totalAmount.multiply(BigDecimal.valueOf(0.025));
            sellerPayout = totalAmount.subtract(platformFee).subtract(paymentProcessingFee);
            escrowAmount = totalAmount;
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

    public enum PayoutStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
