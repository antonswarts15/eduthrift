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
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;
import za.co.thrift.eduthrift.security.JwtUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "https://admin.eduthrift.co.za", "https://www.admin.eduthrift.co.za", "http://154.65.107.50:3000", "http://154.65.107.50:3001", "http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${file.upload.dir:/app/uploads}")
    private String uploadDir;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("Login attempt for: " + request.getEmail());

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

            System.out.println("Login successful for: " + user.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, typeName));

        } catch (Exception e) {
            System.out.println("Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
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

            userRepository.save(user);

            // Generate token so user is logged in immediately after registration
            String typeName = user.getUserType().name();
            String token = jwtUtil.generateToken(user.getEmail(), typeName);

            System.out.println("Registration successful for: " + user.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, typeName));

        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
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
            user.setVerificationStatus("pending");
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "ID document uploaded successfully",
                    "path", savedPath
            ));
        } catch (IOException e) {
            System.out.println("File upload failed: " + e.getMessage());
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
            user.setVerificationStatus("pending");
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Proof of residence uploaded successfully",
                    "path", savedPath
            ));
        } catch (IOException e) {
            System.out.println("File upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to upload file"));
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
        private String idDocumentPath;
        private String proofOfResidencePath;
        private String verificationStatus;
        private Boolean sellerVerified;

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
            this.idDocumentPath = user.getIdDocumentUrl();
            this.proofOfResidencePath = user.getProofOfAddressUrl();
            this.verificationStatus = user.getVerificationStatus();
            this.sellerVerified = user.getSellerVerified();
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
        public String getIdDocumentPath() { return idDocumentPath; }
        public String getProofOfResidencePath() { return proofOfResidencePath; }
        public String getVerificationStatus() { return verificationStatus; }
        public Boolean getSellerVerified() { return sellerVerified; }
    }
}
