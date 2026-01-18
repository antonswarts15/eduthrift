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
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(request.getPassword())) {
            User user = userOpt.get();
            if (!"BOTH".equals(user.getUserType().name()) && !"SELLER".equals(user.getUserType().name())) {
                return ResponseEntity.status(403).body("Access denied. Not an admin.");
            }
            return ResponseEntity.ok(new LoginResponse("fake-admin-token", user.getUserType().name()));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile() {
        return ResponseEntity.ok(new LoginResponse("fake-admin-token", "admin"));
    }
}

class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class LoginResponse {
    private String token;
    private String userType;
    public LoginResponse(String token, String userType) { this.token = token; this.userType = userType; }
    public String getToken() { return token; }
    public String getUserType() { return userType; }
}
