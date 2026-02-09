package za.co.thrift.eduthrift.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private UserType userType = UserType.BOTH;
    
    @Column(name = "school_name")
    private String schoolName;

    private String town;

    private String suburb;

    private String province;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "seller_verified")
    private Boolean sellerVerified = false;

    @Column(name = "verification_status")
    private String verificationStatus = "pending";

    @Column(name = "id_document_url")
    private String idDocumentUrl;

    @Column(name = "proof_of_address_url")
    private String proofOfAddressUrl;

    @Column(name = "id_number")
    private String idNumber;

    @Column(name = "street_address")
    private String streetAddress;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_account_type")
    private String bankAccountType;

    @Column(name = "bank_branch_code")
    private String bankBranchCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Item> items;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum UserType {
        SELLER, BUYER, BOTH, ADMIN
    }
}