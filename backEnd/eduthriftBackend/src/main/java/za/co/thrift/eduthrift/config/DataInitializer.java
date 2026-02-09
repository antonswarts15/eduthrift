package za.co.thrift.eduthrift.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure antons@eduthrift.co.za is ADMIN
        Optional<User> antonsOpt = userRepository.findByEmail("antons@eduthrift.co.za");
        if (antonsOpt.isPresent()) {
            User antons = antonsOpt.get();
            if (antons.getUserType() != User.UserType.ADMIN) {
                antons.setUserType(User.UserType.ADMIN);
                antons.setStatus("active");
                antons.setVerificationStatus("verified");
                userRepository.save(antons);
                System.out.println("Updated antons@eduthrift.co.za to ADMIN role.");
            }
        }

        // Create default admin if not exists
        createUserIfNotExists("admin@eduthrift.co.za", "admin123", "Admin", "User",
                "0000000000", User.UserType.ADMIN, "N/A", "N/A", "N/A");

        // Create test buyer
        createUserIfNotExists("pieter@buyer.co.za", "password123", "Pieter", "Buyer",
                "0811234567", User.UserType.BUYER, "Sandton", "Johannesburg", "Gauteng");

        // Create test seller
        createUserIfNotExists("susan@seller.co.za", "password123", "Susan", "Seller",
                "0829876543", User.UserType.SELLER, "Stellenbosch", "Cape Town", "Western Cape");

        System.out.println("============================================");
        System.out.println("  SEED USERS READY:");
        System.out.println("  Admin:  admin@eduthrift.co.za / admin123");
        System.out.println("  Buyer:  pieter@buyer.co.za / password123");
        System.out.println("  Seller: susan@seller.co.za / password123");
        System.out.println("============================================");
    }

    private void createUserIfNotExists(String email, String password, String firstName, String lastName,
                                        String phone, User.UserType userType,
                                        String suburb, String town, String province) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(phone);
            user.setUserType(userType);
            user.setStatus("active");
            user.setVerificationStatus(userType == User.UserType.SELLER ? "pending" : "verified");
            user.setSellerVerified(userType != User.UserType.SELLER);
            user.setSuburb(suburb);
            user.setTown(town);
            user.setProvince(province);
            userRepository.save(user);
            System.out.println("Created user: " + email + " (" + userType + ")");
        }
    }
}
