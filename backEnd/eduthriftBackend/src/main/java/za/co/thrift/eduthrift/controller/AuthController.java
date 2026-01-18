package za.co.thrift.eduthrift.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.User; // assume you have a User entity
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
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (!user.getPasswordHash().equals(request.getPassword())) {
                        return ResponseEntity.status(401).body("Invalid credentials");
                    }
                    if (user.getUserType() != User.UserType.BOTH && user.getUserType() != User.UserType.SELLER) {
                        // Adjust based on your "admin" definition
                        return ResponseEntity.status(403).body("Access denied. Not an admin.");
                    }
                    return ResponseEntity.ok(new LoginResponse("fake-admin-token", user.getUserType().name()));
                })
                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }


    @GetMapping("/profile")
    public ResponseEntity<?> profile() {
        // For now, return a mock admin profile
        return ResponseEntity.ok(new LoginResponse("fake-admin-token", "admin"));
    }
}

// Helper classes
class LoginRequest {
    private String email;
    private String password;
    // getters & setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class LoginResponse {
    private String token;
    private String userType;
    public LoginResponse(String token, String userType) {
        this.token = token;
        this.userType = userType;
    }
    // getters
    public String getToken() { return token; }
    public String getUserType() { return userType; }
}
