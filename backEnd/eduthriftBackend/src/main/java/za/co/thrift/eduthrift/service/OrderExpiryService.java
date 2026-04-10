package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.ItemRepository;
import za.co.thrift.eduthrift.repository.OrderRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderExpiryService {

    private static final Logger log = LoggerFactory.getLogger(OrderExpiryService.class);

    // How long a PENDING_PAYMENT order is held before auto-cancellation
    private static final int PAYMENT_TIMEOUT_HOURS = 2;

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final FCMNotificationService fcmNotificationService;
    private final EmailService emailService;

    public OrderExpiryService(OrderRepository orderRepository,
                               ItemRepository itemRepository,
                               FCMNotificationService fcmNotificationService,
                               EmailService emailService) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.fcmNotificationService = fcmNotificationService;
        this.emailService = emailService;
    }

    // Runs every 15 minutes
    @Scheduled(fixedDelay = 15 * 60 * 1000)
    public void cancelExpiredOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(PAYMENT_TIMEOUT_HOURS);

        List<Order> expiredOrders = orderRepository
                .findByOrderStatusAndCreatedAtBefore(Order.OrderStatus.PENDING_PAYMENT, cutoff);

        if (expiredOrders.isEmpty()) return;

        log.info("Cancelling {} expired unpaid orders", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                cancelOrderAndRestoreItem(order, "Payment not received within " + PAYMENT_TIMEOUT_HOURS + " hours");
            } catch (Exception e) {
                log.error("Failed to cancel expired order {}: {}", order.getOrderNumber(), e.getMessage());
            }
        }
    }

    public void cancelOrderAndRestoreItem(Order order, String reason) {
        // Cancel the order
        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        orderRepository.save(order);

        // Restore item back to AVAILABLE
        Item item = order.getItem();
        if (item != null && item.getStatus() == Item.ItemStatus.RESERVED) {
            item.setStatus(Item.ItemStatus.AVAILABLE);
            itemRepository.save(item);
            log.info("Item {} restored to AVAILABLE after order {} cancelled ({})",
                    item.getId(), order.getOrderNumber(), reason);
        }

        // Notify buyer
        fcmNotificationService.send(
                order.getBuyer().getFcmToken(),
                "Order Cancelled",
                "Your order " + order.getOrderNumber() + " was cancelled — " + reason +
                ". The item has been returned to listings."
        );

        // Send cancellation email to buyer
        try {
            emailService.sendOrderCancellationEmail(order, reason);
        } catch (Exception e) {
            log.warn("Failed to send cancellation email for order {}", order.getOrderNumber());
        }
    }
}
