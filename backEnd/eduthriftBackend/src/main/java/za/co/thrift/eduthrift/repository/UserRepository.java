package za.co.thrift.eduthrift.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.thrift.eduthrift.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByUserType(User.UserType userType);

    List<User> findByVerificationStatus(String verificationStatus);

    @Query("SELECT u FROM User u WHERE u.userType IN (:types) AND u.verificationStatus = :status")
    List<User> findByUserTypeInAndVerificationStatus(@Param("types") List<User.UserType> types, @Param("status") String status);

    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("search") String search);

    @Query("SELECT u FROM User u WHERE u.userType = :userType AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<User> searchUsersByType(@Param("userType") User.UserType userType, @Param("search") String search);

    long countByUserType(User.UserType userType);

    long countByVerificationStatus(String verificationStatus);

    long countByStatus(String status);
}
