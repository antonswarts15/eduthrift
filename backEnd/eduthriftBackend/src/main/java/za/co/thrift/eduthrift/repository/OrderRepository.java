package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Order> findBySellerOrderByCreatedAtDesc(User seller);
    List<Order> findByPaymentHash(String paymentHash);
}
