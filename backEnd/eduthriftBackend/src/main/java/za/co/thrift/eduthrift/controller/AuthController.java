package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.ItemRepository;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.security.JwtUtil;
import za.co.thrift.eduthrift.service.EmailService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${file.upload.dir:/app/uploads}")
    private String uploadDir;

    public AuthController(UserRepository userRepository,
                          ItemRepository itemRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }

            User user = userOpt.get();

            if (user.getUserType() == null) {
                return ResponseEntity.status(403).body("Access denied. Invalid user type.");
            }

            String typeName = user.getUserType().name();

            if (!"BOTH".equals(typeName) && !"SELLER".equals(typeName) && !"ADMIN".equals(typeName) && !"BUYER".equals(typeName)) {
                return ResponseEntity.status(403).body("Access denied. Not authorized.");
            }

            // Generate real JWT token
            String token = jwtUtil.generateToken(user.getEmail(), typeName);

            return ResponseEntity.ok(new LoginResponse(token, typeName));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Validate inputs
            if (request.getEmail() == null || !request.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Valid email is required"));
            }
            if (request.getPassword() == null || request.getPassword().length() < 8) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Password must be at least 8 characters"));
            }
            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(400).body(new ErrorResponse("Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhone(request.getPhone());
            user.setSuburb(request.getSuburb());
            user.setTown(request.getTown());
            user.setProvince(request.getProvince());

            // Set user type, default to BOTH
            String requestedType = request.getUserType();
            if (requestedType != null) {
                try {
                    user.setUserType(User.UserType.valueOf(requestedType.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setUserType(User.UserType.BOTH);
                }
            } else {
                user.setUserType(User.UserType.BOTH);
            }

            user.setVerificationStatus("unverified");
            user.setSellerVerified(false);
            userRepository.save(user);
            emailService.sendWelcomeEmail(user);

            // Generate token so user is logged in immediately after registration
            String typeName = user.getUserType().name();
            String token = jwtUtil.generateToken(user.getEmail(), typeName);

            return ResponseEntity.ok(new LoginResponse(token, typeName));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Registration failed. Please try again."));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new ProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        try {
            User user = userOpt.get();
            if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
            if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
            if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
            if (updates.containsKey("schoolName")) user.setSchoolName((String) updates.get("schoolName"));
            if (updates.containsKey("suburb")) user.setSuburb((String) updates.get("suburb"));
            if (updates.containsKey("town")) user.setTown((String) updates.get("town"));
            if (updates.containsKey("province")) user.setProvince((String) updates.get("province"));
            if (updates.containsKey("streetAddress")) user.setStreetAddress((String) updates.get("streetAddress"));
            if (updates.containsKey("postalCode")) user.setPostalCode((String) updates.get("postalCode"));
            if (updates.containsKey("bankName")) user.setBankName((String) updates.get("bankName"));
            if (updates.containsKey("bankAccountNumber")) user.setBankAccountNumber((String) updates.get("bankAccountNumber"));
            if (updates.containsKey("bankAccountType")) user.setBankAccountType((String) updates.get("bankAccountType"));
            if (updates.containsKey("bankBranchCode")) user.setBankBranchCode((String) updates.get("bankBranchCode"));
            
            userRepository.save(user);
            return ResponseEntity.ok(new ProfileResponse(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update profile. Please try again."));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (currentPassword == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Current password and a new password of at least 8 characters are required"));
        }
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Current password is incorrect"));
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PutMapping("/fcm-token")
    public ResponseEntity<?> saveFcmToken(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }
        String token = (String) body.get("fcmToken");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("fcmToken is required"));
        }
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        userOpt.get().setFcmToken(token);
        userRepository.save(userOpt.get());
        return ResponseEntity.ok(Map.of("message", "FCM token saved"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@RequestBody(required = false) Map<String, String> body,
                                           Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        User user = userOpt.get();
        // Verify password before deletion
        String password = body != null ? body.get("password") : null;
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Incorrect password"));
        }
        // Delist all active items so they no longer appear to buyers
        List<Item> userItems = itemRepository.findByUserOrderByCreatedAtDesc(user);
        userItems.stream()
                .filter(item -> item.getStatus() == Item.ItemStatus.AVAILABLE)
                .forEach(item -> item.setStatus(Item.ItemStatus.SOLD));
        itemRepository.saveAll(userItems);

        // Soft-delete: anonymise PII so the record survives for compliance,
        // but free the email so the user can re-register in future.
        String anonymisedEmail = "deleted_" + user.getId() + "@deleted.eduthrift.co.za";
        user.setEmail(anonymisedEmail);
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFirstName("Deleted");
        user.setLastName("User");
        user.setPhone(null);
        user.setSchoolName(null);
        user.setTown(null);
        user.setSuburb(null);
        user.setProvince(null);
        user.setStreetAddress(null);
        user.setPostalCode(null);
        user.setIdNumber(null);
        user.setIdDocumentUrl(null);
        user.setProofOfAddressUrl(null);
        user.setBankConfirmationUrl(null);
        user.setBankName(null);
        user.setBankAccountNumber(null);
        user.setBankAccountType(null);
        user.setBankBranchCode(null);
        user.setTradeSafeToken(null);
        user.setFcmToken(null);
        user.setStatus("deleted");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @PostMapping("/upload-id-document")
    public ResponseEntity<?> uploadIdDocument(
            @RequestParam("idDocument") MultipartFile file,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        try {
            String savedPath = saveFile(file, "id-documents");
            User user = userOpt.get();
            user.setIdDocumentUrl(savedPath);
            checkAndSetPendingStatus(user);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "ID document uploaded successfully",
                    "path", savedPath
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to upload file"));
        }
    }

    @PostMapping("/upload-proof-of-residence")
    public ResponseEntity<?> uploadProofOfResidence(
            @RequestParam("proofOfResidence") MultipartFile file,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        try {
            String savedPath = saveFile(file, "proof-of-residence");
            User user = userOpt.get();
            user.setProofOfAddressUrl(savedPath);
            checkAndSetPendingStatus(user);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Proof of residence uploaded successfully",
                    "path", savedPath
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to upload file"));
        }
    }

    @PostMapping("/upload-bank-confirmation")
    public ResponseEntity<?> uploadBankConfirmation(
            @RequestParam("bankConfirmation") MultipartFile file,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        try {
            String savedPath = saveFile(file, "bank-confirmations");
            User user = userOpt.get();
            user.setBankConfirmationUrl(savedPath);
            checkAndSetPendingStatus(user);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Bank confirmation letter uploaded successfully",
                    "path", savedPath
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to upload file"));
        }
    }

    /** Sets status to "pending" and emails admin only once all 3 docs are present. */
    private void checkAndSetPendingStatus(User user) {
        boolean allDocsPresent = user.getIdDocumentUrl() != null
                && user.getProofOfAddressUrl() != null
                && user.getBankConfirmationUrl() != null;
        if (allDocsPresent && !"pending".equals(user.getVerificationStatus())
                && !"verified".equals(user.getVerificationStatus())) {
            user.setVerificationStatus("pending");
            emailService.sendSellerDocumentsSubmittedEmail(user);
        }
    }

    private String saveFile(MultipartFile file, String subdirectory) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subdirectory);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return the URL path that will be used to serve the file
        return "/uploads/" + subdirectory + "/" + uniqueFilename;
    }

    // ---------------- Nested classes ----------------

    public static class RegisterRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String phone;
        private String suburb;
        private String town;
        private String province;
        private String userType;

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSuburb() { return suburb; }
        public void setSuburb(String suburb) { this.suburb = suburb; }
        public String getTown() { return town; }
        public void setTown(String town) { this.town = town; }
        public String getProvince() { return province; }
        public void setProvince(String province) { this.province = province; }
        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }
    }

    public static class ErrorResponse {
        private String error;
        public ErrorResponse(String error) { this.error = error; }
        public String getError() { return error; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private String userType;

        public LoginResponse(String token, String userType) {
            this.token = token;
            this.userType = userType;
        }

        public String getToken() { return token; }
        public String getUserType() { return userType; }
    }

    public static class ProfileResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String userType;
        private String phone;
        private String schoolName;
        private String town;
        private String suburb;
        private String province;
        private String streetAddress;
        private String postalCode;
        private String idDocumentPath;
        private String proofOfResidencePath;
        private String bankConfirmationPath;
        private String verificationStatus;
        private Boolean sellerVerified;
        private String bankName;
        private String bankAccountNumber;
        private String bankAccountType;
        private String bankBranchCode;

        public ProfileResponse(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.userType = user.getUserType() != null ? user.getUserType().name() : null;
            this.phone = user.getPhone();
            this.schoolName = user.getSchoolName();
            this.town = user.getTown();
            this.suburb = user.getSuburb();
            this.province = user.getProvince();
            this.streetAddress = user.getStreetAddress();
            this.postalCode = user.getPostalCode();
            this.idDocumentPath = user.getIdDocumentUrl();
            this.proofOfResidencePath = user.getProofOfAddressUrl();
            this.bankConfirmationPath = user.getBankConfirmationUrl();
            this.verificationStatus = user.getVerificationStatus();
            this.sellerVerified = user.getSellerVerified();
            this.bankName = user.getBankName();
            this.bankAccountNumber = user.getBankAccountNumber();
            this.bankAccountType = user.getBankAccountType();
            this.bankBranchCode = user.getBankBranchCode();
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getUserType() { return userType; }
        public String getPhone() { return phone; }
        public String getSchoolName() { return schoolName; }
        public String getTown() { return town; }
        public String getSuburb() { return suburb; }
        public String getProvince() { return province; }
        public String getStreetAddress() { return streetAddress; }
        public String getPostalCode() { return postalCode; }
        public String getIdDocumentPath() { return idDocumentPath; }
        public String getProofOfResidencePath() { return proofOfResidencePath; }
        public String getBankConfirmationPath() { return bankConfirmationPath; }
        public String getVerificationStatus() { return verificationStatus; }
        public Boolean getSellerVerified() { return sellerVerified; }
        public String getBankName() { return bankName; }
        public String getBankAccountNumber() { return bankAccountNumber; }
        public String getBankAccountType() { return bankAccountType; }
        public String getBankBranchCode() { return bankBranchCode; }
    }
}
