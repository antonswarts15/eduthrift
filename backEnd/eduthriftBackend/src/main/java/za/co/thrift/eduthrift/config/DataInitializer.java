package za.co.thrift.eduthrift.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Runs on startup to ensure required system accounts exist.
 *
 * <h2>What always runs (production-safe)</h2>
 * <ul>
 *   <li>Promotes {@code antons@eduthrift.co.za} to ADMIN if the account exists.</li>
 *   <li>Creates {@code admin@eduthrift.co.za} using the password from
 *       {@code ADMIN_INITIAL_PASSWORD} env var. If the env var is not set, a random
 *       UUID password is generated and logged ONCE at startup — change it immediately.</li>
 * </ul>
 *
 * <h2>What only runs in dev/test ({@code CREATE_TEST_DATA=true})</h2>
 * <ul>
 *   <li>Test buyer: {@code pieter@buyer.co.za / password123}</li>
 *   <li>Test seller: {@code susan@seller.co.za / password123}</li>
 * </ul>
 *
 * <p><strong>Never set {@code CREATE_TEST_DATA=true} in production.</strong>
 * It creates accounts with well-known passwords that are a security risk.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Password for the fallback admin account.
     * Must be set via environment variable in production.
     * If not set, a random UUID is used and logged once — change it immediately.
     */
    @Value("${ADMIN_INITIAL_PASSWORD:}")
    private String adminInitialPassword;

    /**
     * Set to {@code true} only in development/test environments.
     * Creates test buyer and seller accounts with known passwords.
     * <strong>Never {@code true} in production.</strong>
     */
    @Value("${CREATE_TEST_DATA:false}")
    private boolean createTestData;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        promoteOwnerToAdmin();
        ensureAdminAccount();

        if (createTestData) {
            log.warn("CREATE_TEST_DATA=true — creating test accounts. DO NOT use in production.");
            createTestAccounts();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    /** Promote the owner account to ADMIN if it exists and isn't already. */
    private void promoteOwnerToAdmin() {
        userRepository.findByEmail("antons@eduthrift.co.za").ifPresent(user -> {
            if (user.getUserType() != User.UserType.ADMIN) {
                user.setUserType(User.UserType.ADMIN);
                user.setStatus("active");
                user.setVerificationStatus("verified");
                userRepository.save(user);
                log.info("Promoted antons@eduthrift.co.za to ADMIN");
            }
        });
    }

    /** Create the fallback admin account if it does not exist. */
    private void ensureAdminAccount() {
        if (userRepository.findByEmail("admin@eduthrift.co.za").isPresent()) return;

        String password;
        if (adminInitialPassword != null && !adminInitialPassword.isBlank()) {
            password = adminInitialPassword;
        } else {
            password = UUID.randomUUID().toString();
            // Logged at WARN so it is visible in any log aggregator
            log.warn("ADMIN_INITIAL_PASSWORD not set — generated random password for admin@eduthrift.co.za: {}", password);
            log.warn("Change this password immediately after first login.");
        }

        User admin = new User();
        admin.setEmail("admin@eduthrift.co.za");
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhone("0000000000");
        admin.setUserType(User.UserType.ADMIN);
        admin.setStatus("active");
        admin.setVerificationStatus("verified");
        admin.setSellerVerified(true);
        admin.setSuburb("N/A");
        admin.setTown("N/A");
        admin.setProvince("N/A");
        userRepository.save(admin);
        log.info("Created admin@eduthrift.co.za");
    }

    /** Create test accounts — only called when {@code CREATE_TEST_DATA=true}. */
    private void createTestAccounts() {
        createUserIfNotExists("pieter@buyer.co.za", "password123", "Pieter", "Buyer",
                "0811234567", User.UserType.BUYER, "Sandton", "Johannesburg", "Gauteng");

        createUserIfNotExists("susan@seller.co.za", "password123", "Susan", "Seller",
                "0829876543", User.UserType.SELLER, "Stellenbosch", "Cape Town", "Western Cape");
    }

    private void createUserIfNotExists(String email, String password, String firstName, String lastName,
                                        String phone, User.UserType userType,
                                        String suburb, String town, String province) {
        if (userRepository.findByEmail(email).isPresent()) return;

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
        log.info("Test account created: {}", email);
    }
}
