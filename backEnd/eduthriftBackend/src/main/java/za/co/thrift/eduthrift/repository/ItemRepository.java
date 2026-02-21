package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.User;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByItemTypeId(Long itemTypeId);
    List<Item> findBySchoolName(String schoolName);
    List<Item> findByStatus(Item.ItemStatus status);
    List<Item> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT i FROM Item i WHERE " +
           "(:itemTypeId IS NULL OR i.itemType.id = :itemTypeId) AND " +
           "(:schoolName IS NULL OR i.schoolName = :schoolName) AND " +
           "(:status IS NULL OR i.status = :status)")
    List<Item> findByFilters(@Param("itemTypeId") Long itemTypeId,
                            @Param("schoolName") String schoolName,
                            @Param("status") Item.ItemStatus status);
}
