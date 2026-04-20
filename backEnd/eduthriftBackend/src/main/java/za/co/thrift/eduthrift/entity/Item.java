package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    @JoinColumn(name = "item_type_id")
    private ItemType itemType;

    @Column(name = "item_name")
    private String itemName;

    private String category;

    private String subcategory;

    private String sport;

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

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer quantity = 1;

    @Column(name = "large_item", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean largeItem = false;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "relist_count", columnDefinition = "INT DEFAULT 0")
    private Integer relistCount = 0;

    @Column(name = "expiry_reminder_sent", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean expiryReminderSent = false;

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
        AVAILABLE, SOLD, RESERVED, EXPIRED
    }
}
