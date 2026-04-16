package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.thrift.eduthrift.entity.LedgerEntry;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    /** All entries for a given order — use for per-order reconciliation. */
    List<LedgerEntry> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    /** All entries for a specific account type — use for balance calculations. */
    List<LedgerEntry> findByAccountTypeAndEntryType(
            LedgerEntry.AccountType accountType, LedgerEntry.EntryType entryType);

    /**
     * Balance for a given account type:
     *   SUM(CREDIT) - SUM(DEBIT) for that account.
     * A positive result means the account has a positive balance (e.g. ESCROW holds funds).
     * A negative result indicates an error in the ledger (should never happen).
     */
    @Query("""
            SELECT COALESCE(
                SUM(CASE WHEN e.entryType = 'CREDIT' THEN e.amount ELSE -e.amount END),
                0
            )
            FROM LedgerEntry e
            WHERE e.accountType = :accountType
            """)
    BigDecimal getBalance(@Param("accountType") LedgerEntry.AccountType accountType);

    /**
     * Outstanding seller balance — total money owed to all sellers that has not yet
     * been paid out (i.e. SELLER CREDIT with no corresponding DEBIT).
     * Use this to answer "how much do we owe sellers right now?"
     */
    @Query("""
            SELECT COALESCE(
                SUM(CASE WHEN e.entryType = 'CREDIT' THEN e.amount ELSE -e.amount END),
                0
            )
            FROM LedgerEntry e
            WHERE e.accountType = 'SELLER'
            """)
    BigDecimal getTotalOutstandingSellerBalance();

    /**
     * Platform revenue earned within a date range.
     * Use for monthly/weekly revenue reporting.
     */
    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM LedgerEntry e
            WHERE e.accountType = 'PLATFORM'
              AND e.entryType = 'CREDIT'
              AND e.createdAt >= :from
              AND e.createdAt < :to
            """)
    BigDecimal getPlatformRevenueBetween(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    /**
     * Balance owed to a specific seller (by their user ID).
     */
    @Query("""
            SELECT COALESCE(
                SUM(CASE WHEN e.entryType = 'CREDIT' THEN e.amount ELSE -e.amount END),
                0
            )
            FROM LedgerEntry e
            WHERE e.accountType = 'SELLER'
              AND e.userId = :userId
            """)
    BigDecimal getSellerBalance(@Param("userId") Long userId);
}
