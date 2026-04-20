package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.repository.ItemRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ItemExpiryService {

    private static final Logger log = LoggerFactory.getLogger(ItemExpiryService.class);

    private final ItemRepository itemRepository;
    private final EmailService emailService;

    public ItemExpiryService(ItemRepository itemRepository, EmailService emailService) {
        this.itemRepository = itemRepository;
        this.emailService = emailService;
    }

    /**
     * Runs daily at 08:00.
     * 1. Sends a 14-day expiry reminder for listings that haven't had one yet.
     * 2. Marks listings whose expiry date has passed as EXPIRED.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processExpiringListings() {
        LocalDate today = LocalDate.now();

        // ── Expiry reminders ──────────────────────────────────────────────────
        List<Item> toRemind = itemRepository.findItemsExpiringBetweenWithoutReminder(
                Item.ItemStatus.AVAILABLE, today.plusDays(13), today.plusDays(14));

        for (Item item : toRemind) {
            try {
                emailService.sendListingExpiryReminderEmail(item, 14);
                item.setExpiryReminderSent(true);
                itemRepository.save(item);
                log.info("Expiry reminder sent for item {} (seller: {})", item.getId(), item.getUser().getEmail());
            } catch (Exception e) {
                log.error("Failed to send expiry reminder for item {}: {}", item.getId(), e.getMessage());
            }
        }

        // ── Expire overdue listings ───────────────────────────────────────────
        List<Item> toExpire = itemRepository.findByStatusAndExpiryDateLessThanEqual(
                Item.ItemStatus.AVAILABLE, today);

        for (Item item : toExpire) {
            try {
                item.setStatus(Item.ItemStatus.EXPIRED);
                itemRepository.save(item);
                log.info("Listing expired: item {} (seller: {})", item.getId(), item.getUser().getEmail());
            } catch (Exception e) {
                log.error("Failed to expire item {}: {}", item.getId(), e.getMessage());
            }
        }

        if (!toRemind.isEmpty() || !toExpire.isEmpty()) {
            log.info("Expiry job complete — reminders sent: {}, listings expired: {}",
                    toRemind.size(), toExpire.size());
        }
    }
}
