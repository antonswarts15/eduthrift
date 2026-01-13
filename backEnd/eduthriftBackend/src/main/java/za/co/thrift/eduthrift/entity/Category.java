package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String slug;
    
    private String icon;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Subcategory> subcategories;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<ItemType> itemTypes;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}