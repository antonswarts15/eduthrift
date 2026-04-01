package za.co.thrift.eduthrift.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.repository.OrderRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EscrowService {

    private final OrderRepository orderRepository;
    private final TradeSafeService tradeSafeService;

    public EscrowService(OrderRepository orderRepository, TradeSafeService tradeSafeService) {
        this.orderRepository = orderRepository;
        this.tradeSafeService = tradeSafeService;
    }

    @Transactional
    public void holdFunds(Order order) {
        order.setEscrowStatus(Order.EscrowStatus.HELD);
        order.setPaymentStatus(Order.PaymentStatus.CAPTURED);
        order.setOrderStatus(Order.OrderStatus.PAYMENT_CONFIRMED);
        orderRepository.save(order);
    }

    @Transactional
    public void releaseToSeller(String orderNumber) {
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderNumber);
        }

        Order order = orderOpt.get();
        
        if (order.getEscrowStatus() != Order.EscrowStatus.HELD) {
            throw new RuntimeException("Funds not in escrow for order: " + orderNumber);
        }

        if (!order.getDeliveryConfirmed()) {
            throw new RuntimeException("Delivery not confirmed for order: " + orderNumber);
        }

        order.setEscrowStatus(Order.EscrowStatus.RELEASED_TO_SELLER);
        order.setPayoutStatus(Order.PayoutStatus.PROCESSING);
        order.setOrderStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);

        processPayout(order);
    }

    @Transactional
    public void confirmDelivery(String orderNumber) {
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderNumber);
        }

        Order order = orderOpt.get();
        order.setDeliveryConfirmed(true);
        order.setDeliveryConfirmedDate(LocalDateTime.now());
        order.setOrderStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(order);

        // Tell TradeSafe the buyer has accepted delivery — this triggers fund release to the seller.
        // TradeSafe will then POST back DELIVERY_ACCEPTED + COMPLETED to our /tradesafe/callback.
        if (order.getTradeSafeAllocationId() != null) {
            try {
                tradeSafeService.acceptDelivery(order.getTradeSafeAllocationId());
            } catch (Exception ignored) {
                // Non-fatal: order is marked delivered locally.
                // Admin should manually accept delivery in TradeSafe portal
                // for transaction: order.getTradeSafeTransactionId()
            }
        }
    }

    private void processPayout(Order order) {
        order.setPayoutStatus(Order.PayoutStatus.COMPLETED);
        order.setPayoutDate(LocalDateTime.now());
        orderRepository.save(order);
    }
}
