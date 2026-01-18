package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://154.65.107.50:3000", "http://154.65.107.50:3001"}, allowCredentials = "true")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for: " + request.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (!userOpt.isPresent()) {
            System.out.println("User not found!");
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = userOpt.get();
        System.out.println("User found: " + user.getEmail() + ", userType: " + user.getUserType());

        // Check password safely
        if (user.getPasswordHash() == null || !user.getPasswordHash().equals(request.getPassword())) {
            System.out.println("Password mismatch!");
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // Check userType safely
        if (user.getUserType() == null) {
            System.out.println("User type is null!");
            return ResponseEntity.status(403).body("Access denied. Invalid user type.");
        }

        String typeName = user.getUserType().name();
        if (!"BOTH".equals(typeName) && !"SELLER".equals(typeName)) {
            System.out.println("Access denied for userType: " + typeName);
            return ResponseEntity.status(403).body("Access denied. Not an admin.");
        }

        System.out.println("Login successful for: " + user.getEmail());
        return ResponseEntity.ok(new LoginResponse("fake-admin-token", typeName));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile() {
        return ResponseEntity.ok(new LoginResponse("fake-admin-token", "admin"));
    }

    // ---------------- Nested classes ----------------

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
}
