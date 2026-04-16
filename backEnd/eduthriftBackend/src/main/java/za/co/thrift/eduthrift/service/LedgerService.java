package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.entity.LedgerEntry;
import za.co.thrift.eduthrift.entity.LedgerEntry.AccountType;
import za.co.thrift.eduthrift.entity.LedgerEntry.EntryType;
import za.co.thrift.eduthrift.entity.LedgerEntry.ReferenceType;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.LedgerEntryRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Double-entry financial ledger for Eduthrift.
 *
 * <p>Every method posts a balanced pair (or set) of entries where the total
 * of all DEBITs equals the total of all CREDITs for that event. This invariant
 * makes it possible to detect any discrepancy by checking that the sum of all
 * entries in the ledger equals zero.
 *
 * <p>All posting methods run in {@code REQUIRES_NEW} propagation so ledger
 * writes are committed independently. A failure in the caller's business logic
 * after posting will NOT roll back ledger entries — the ledger is the source
 * of truth and must never be silently lost.
 *
 * <h2>Caller responsibilities</h2>
 * <ul>
 *   <li>{@link #postPaymentReceived} — called from {@code EscrowService.holdFunds()}</li>
 *   <li>{@link #postEscrowRelease}   — called from {@code EscrowService.releaseToSeller()}</li>
 *   <li>{@link #postRefund}          — called from {@code EscrowService.refundToBuyer()}</li>
 *   <li>{@link #postPayout}          — called from {@code PaymentService.payoutSeller()} on COMPLETED</li>
 * </ul>
 */
@Service
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);

    private final LedgerEntryRepository repo;

    public LedgerService(LedgerEntryRepository repo) {
        this.repo = repo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event 1: Buyer pays — funds enter escrow
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Post entries when a buyer's payment is received and funds are held in escrow.
     *
     * <pre>
     * DEBIT  BUYER    totalAmount    "Payment received for order X"
     * CREDIT ESCROW   escrowAmount   "Escrow hold for order X"
     * CREDIT SHIPPING shippingCost   "Shipping collected for order X"
     * </pre>
     *
     * Note: {@code totalAmount = escrowAmount + shippingCost}.
     * The escrow account holds item price + buyer protection fee only.
     * Shipping is tracked separately as it flows to the carrier, not to the seller.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void postPaymentReceived(Order order) {
        String ordRef  = order.getOrderNumber();
        Long buyerId   = order.getBuyer().getId();

        BigDecimal escrowAmount  = nvl(order.getEscrowAmount(),  order.getTotalAmount());
        BigDecimal shippingCost  = nvl(order.getShippingCost(), BigDecimal.ZERO);
        BigDecimal totalAmount   = nvl(order.getTotalAmount(),  escrowAmount.add(shippingCost));

        post(order, buyerId,  EntryType.DEBIT,  AccountType.BUYER,    totalAmount,  ReferenceType.PAYMENT_RECEIVED,   "Payment received for " + ordRef);
        post(order, null,     EntryType.CREDIT, AccountType.ESCROW,   escrowAmount, ReferenceType.ESCROW_HOLD,        "Escrow hold for " + ordRef);

        if (shippingCost.compareTo(BigDecimal.ZERO) > 0) {
            post(order, null, EntryType.CREDIT, AccountType.SHIPPING, shippingCost, ReferenceType.SHIPPING_COLLECTED, "Shipping collected for " + ordRef);
        }

        log.info("Ledger: payment received posted for order {} — total {} / escrow {} / shipping {}",
                ordRef, totalAmount, escrowAmount, shippingCost);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event 2: Escrow released after delivery confirmed
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Post entries when escrow is released to the seller after delivery is confirmed.
     *
     * <pre>
     * DEBIT  ESCROW   escrowAmount   "Escrow released for order X"
     * CREDIT SELLER   sellerPayout   "Seller payout accrued for order X"
     * CREDIT PLATFORM platformFee    "Platform fee earned for order X"
     * </pre>
     *
     * After this posting, the SELLER account has a positive balance representing
     * money that is owed to the seller but not yet transferred to their bank.
     * That balance is cleared by {@link #postPayout(Order)}.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void postEscrowRelease(Order order) {
        String ordRef    = order.getOrderNumber();
        Long sellerId    = order.getSeller().getId();

        BigDecimal escrowAmount = nvl(order.getEscrowAmount(),  order.getTotalAmount());
        BigDecimal sellerPayout = nvl(order.getSellerPayout(),  BigDecimal.ZERO);
        BigDecimal platformFee  = nvl(order.getPlatformFee(),   BigDecimal.ZERO);

        post(order, null,     EntryType.DEBIT,  AccountType.ESCROW,   escrowAmount, ReferenceType.ESCROW_RELEASE, "Escrow released for " + ordRef);
        post(order, sellerId, EntryType.CREDIT, AccountType.SELLER,   sellerPayout, ReferenceType.ESCROW_RELEASE, "Seller payout accrued for " + ordRef);
        post(order, null,     EntryType.CREDIT, AccountType.PLATFORM, platformFee,  ReferenceType.PLATFORM_FEE,   "Platform fee earned for " + ordRef);

        log.info("Ledger: escrow release posted for order {} — seller {} / platform {}",
                ordRef, sellerPayout, platformFee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event 3: Payout executed — funds leave the system to seller's bank
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Post entries when a seller payout is actually executed (bank transfer confirmed).
     *
     * <pre>
     * DEBIT  SELLER   sellerPayout   "Payout executed for order X"
     * CREDIT EXTERNAL sellerPayout   "Funds transferred to seller bank for order X"
     * </pre>
     *
     * After this posting, the SELLER account balance for this order returns to zero.
     * Call this only when {@code payoutStatus = COMPLETED}.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void postPayout(Order order) {
        String ordRef    = order.getOrderNumber();
        Long sellerId    = order.getSeller().getId();
        BigDecimal amount = nvl(order.getSellerPayout(), BigDecimal.ZERO);

        post(order, sellerId, EntryType.DEBIT,  AccountType.SELLER,   amount, ReferenceType.PAYOUT, "Payout executed for " + ordRef);
        post(order, null,     EntryType.CREDIT, AccountType.EXTERNAL, amount, ReferenceType.PAYOUT, "Funds transferred to seller bank for " + ordRef);

        log.info("Ledger: payout posted for order {} — amount {}", ordRef, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event 4: Refund — escrow returned to buyer
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Post entries when a refund is issued to the buyer.
     *
     * <pre>
     * DEBIT  ESCROW   escrowAmount   "Refund released for order X"
     * CREDIT BUYER    escrowAmount   "Buyer refunded for order X"
     * </pre>
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void postRefund(Order order) {
        String ordRef    = order.getOrderNumber();
        Long buyerId     = order.getBuyer().getId();
        BigDecimal amount = nvl(order.getEscrowAmount(), order.getTotalAmount());

        post(order, null,    EntryType.DEBIT,  AccountType.ESCROW, amount, ReferenceType.REFUND, "Refund released for " + ordRef);
        post(order, buyerId, EntryType.CREDIT, AccountType.BUYER,  amount, ReferenceType.REFUND, "Buyer refunded for " + ordRef);

        log.info("Ledger: refund posted for order {} — amount {}", ordRef, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reporting helpers
    // ─────────────────────────────────────────────────────────────────────────

    public BigDecimal getEscrowBalance() {
        return repo.getBalance(AccountType.ESCROW);
    }

    public BigDecimal getTotalOutstandingSellerPayouts() {
        return repo.getTotalOutstandingSellerBalance();
    }

    public BigDecimal getPlatformRevenue(LocalDateTime from, LocalDateTime to) {
        return repo.getPlatformRevenueBetween(from, to);
    }

    public BigDecimal getSellerBalance(Long sellerId) {
        return repo.getSellerBalance(sellerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void post(Order order, Long userId, EntryType type, AccountType account,
                      BigDecimal amount, ReferenceType ref, String description) {
        repo.save(LedgerEntry.of(order, userId, type, account, amount, ref, description));
    }

    private BigDecimal nvl(BigDecimal value, BigDecimal fallback) {
        return value != null ? value : fallback;
    }
}
