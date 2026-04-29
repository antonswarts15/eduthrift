package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Automatically releases escrowed funds to sellers after the buyer's dispute window expires.
 *
 * The timer is set at the point the item is confirmed at the buyer's locker/door:
 *   - PUDO: payoutScheduledAt = now+72h (set by PudoWebhookController on AT_LOCKER event)
 *   - ShipLogic/TCG: payoutScheduledAt = now+48h (set by ShipLogicWebhookController on DELIVERED event)
 *
 * If the buyer raises a dispute before the timer expires, payoutScheduledAt is nulled
 * by EscrowService.raiseDispute() — freezing the timer until admin resolves.
 *
 * Runs every 30 minutes. Idempotent — releaseToSeller() guards against double-release
 * by checking escrowStatus == HELD.
 */
@Service
public class EscrowAutoReleaseService {

    private static final Logger log = LoggerFactory.getLogger(EscrowAutoReleaseService.class);

    private final OrderRepository orderRepository;
    private final EscrowService escrowService;
    private final FCMNotificationService fcmNotificationService;

    public EscrowAutoReleaseService(OrderRepository orderRepository,
                                    EscrowService escrowService,
                                    FCMNotificationService fcmNotificationService) {
        this.orderRepository = orderRepository;
        this.escrowService = escrowService;
        this.fcmNotificationService = fcmNotificationService;
    }

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    public void releaseExpiredEscrows() {
        List<Order> eligible = orderRepository.findEligibleForAutoRelease(
                Order.OrderStatus.DELIVERED,
                LocalDateTime.now(),
                Order.DisputeStatus.NONE
        );

        if (eligible.isEmpty()) return;

        log.info("Auto-release scan: {} order(s) past dispute window", eligible.size());

        for (Order order : eligible) {
            try {
                escrowService.releaseToSeller(order);

                fcmNotificationService.send(
                        order.getSeller().getFcmToken(),
                        "Payment Released",
                        "Funds for order " + order.getOrderNumber() + " have been released to your account."
                );
                fcmNotificationService.send(
                        order.getBuyer().getFcmToken(),
                        "Order Complete",
                        "Order " + order.getOrderNumber() + " is now complete. Thanks for using Eduthrift!"
                );

                log.info("Auto-released escrow for order {}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Auto-release failed for order {}: {}", order.getOrderNumber(), e.getMessage());
            }
        }
    }
}
