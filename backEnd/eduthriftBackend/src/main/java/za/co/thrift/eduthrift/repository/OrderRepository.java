package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Order> findBySellerOrderByCreatedAtDesc(User seller);
    Optional<Order> findByTradeSafeTransactionId(String tradeSafeTransactionId);
    Optional<Order> findByTrackingNumber(String trackingNumber);
    Optional<Order> findByTcgShipmentId(String tcgShipmentId);
    List<Order> findByOrderStatusAndCreatedAtBefore(Order.OrderStatus status, LocalDateTime cutoff);
    List<Order> findByOrderStatusAndPayoutScheduledAtBefore(Order.OrderStatus status, LocalDateTime cutoff);

    /**
     * Find orders eligible for payout retry:
     * {@code payout_status = FAILED} AND {@code payout_attempts < maxAttempts}.
     * The caller is responsible for checking the per-order backoff window.
     */
    List<Order> findByPayoutStatusAndPayoutAttemptsLessThan(
            Order.PayoutStatus payoutStatus, int maxAttempts);
}
