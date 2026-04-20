package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.thrift.eduthrift.entity.PaymentTransaction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    /** All events recorded for a given order, in insertion order. */
    List<PaymentTransaction> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    /** Look up a specific event by provider reference — used for reconciliation. */
    Optional<PaymentTransaction> findByProviderAndProviderTransactionId(
            String provider, String providerTransactionId);

    /**
     * Idempotency check: returns {@code true} if the exact same event has already
     * been recorded for this provider transaction.
     */
    boolean existsByProviderAndProviderTransactionIdAndEventType(
            String provider, String providerTransactionId, String eventType);

    /** All payment events in a date range, with Order eagerly fetched — used for audit trail reports. */
    @Query("SELECT pt FROM PaymentTransaction pt JOIN FETCH pt.order o WHERE pt.createdAt >= :from AND pt.createdAt < :to ORDER BY pt.createdAt ASC")
    List<PaymentTransaction> findWithOrderByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
