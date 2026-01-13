package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import za.co.thrift.eduthrift.entity.ItemType;
import java.util.List;

@Repository
public interface ItemTypeRepository extends JpaRepository<ItemType, Long> {
    List<ItemType> findByCategoryId(Long categoryId);
    List<ItemType> findBySubcategoryId(Long subcategoryId);
    List<ItemType> findBySportId(Long sportId);
    
    @Query("SELECT it FROM ItemType it WHERE " +
           "(:categoryId IS NULL OR it.category.id = :categoryId) AND " +
           "(:subcategoryId IS NULL OR it.subcategory.id = :subcategoryId) AND " +
           "(:sportId IS NULL OR it.sport.id = :sportId)")
    List<ItemType> findByFilters(@Param("categoryId") Long categoryId,
                                @Param("subcategoryId") Long subcategoryId,
                                @Param("sportId") Long sportId);
}