package za.co.thrift.eduthrift.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;


import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://154.65.107.50:3000", "http://154.65.107.50:3001"}, allowCredentials = "true")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("Login attempt for: " + request.getEmail());

            // 🔐 Let Spring Security authenticate (BCrypt + UserDetailsService)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Load user to check userType
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }

            User user = userOpt.get();

            if (user.getUserType() == null) {
                return ResponseEntity.status(403).body("Access denied. Invalid user type.");
            }

            String typeName = user.getUserType().name();

            if (!"BOTH".equals(typeName) && !"SELLER".equals(typeName) && !"ADMIN".equals(typeName)) {
                return ResponseEntity.status(403).body("Access denied. Not an admin.");
            }

            System.out.println("Login successful for: " + user.getEmail());
            return ResponseEntity.ok(new LoginResponse("fake-admin-token", typeName));

        } catch (Exception e) {
            System.out.println("Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Invalid credentials");
        }
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
