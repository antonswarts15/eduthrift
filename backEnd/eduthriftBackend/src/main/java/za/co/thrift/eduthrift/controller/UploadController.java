package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "https://admin.eduthrift.co.za", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class UploadController {

    @Value("${file.upload.dir:/app/uploads}")
    private String uploadDir;

    @PostMapping("/images")
    public ResponseEntity<?> uploadImages(
            @RequestParam("images") List<MultipartFile> images,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Path uploadPath = Paths.get(uploadDir, "items");
            Files.createDirectories(uploadPath);

            List<Map<String, String>> uploadedFiles = new ArrayList<>();

            for (MultipartFile image : images) {
                if (image.isEmpty()) continue;

                // Validate file type
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
                }

                // Generate unique filename
                String originalFilename = image.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFilename = UUID.randomUUID().toString() + extension;

                // Save file
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                String fileUrl = "/uploads/items/" + uniqueFilename;
                uploadedFiles.add(Map.of(
                        "url", fileUrl,
                        "filename", uniqueFilename
                ));
            }

            return ResponseEntity.ok(Map.of("files", uploadedFiles));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload images: " + e.getMessage()));
        }
    }
}
