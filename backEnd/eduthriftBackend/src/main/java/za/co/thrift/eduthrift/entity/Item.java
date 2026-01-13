package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "item_type_id", nullable = false)
    private ItemType itemType;
    
    @Column(name = "school_name")
    private String schoolName;
    
    @Column(name = "club_name")
    private String clubName;
    
    private String team;
    
    private String size;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(name = "condition_grade")
    private Integer conditionGrade;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "front_photo", columnDefinition = "TEXT")
    private String frontPhoto;
    
    @Column(name = "back_photo", columnDefinition = "TEXT")
    private String backPhoto;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.AVAILABLE;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Gender {
        BOY, GIRL, UNISEX
    }
    
    public enum ItemStatus {
        AVAILABLE, SOLD, RESERVED
    }
}