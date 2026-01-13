package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "item_types")
@Data
public class ItemType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;
    
    @ManyToOne
    @JoinColumn(name = "sport_id")
    private Sport sport;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String slug;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "itemType", cascade = CascadeType.ALL)
    private List<Item> items;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}