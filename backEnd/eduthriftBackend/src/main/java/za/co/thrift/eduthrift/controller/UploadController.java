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
import java.util.Set;

@RestController
@RequestMapping("/upload")
public class UploadController {

    @Value("${file.upload.dir:/app/uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif"
    );

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

                // Validate content type against explicit whitelist
                String contentType = image.getContentType();
                if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed (jpg, png, webp, heic, gif)"));
                }

                // Generate unique filename preserving only whitelisted extensions
                String originalFilename = image.getOriginalFilename();
                String extension = ".jpg"; // safe default
                if (originalFilename != null && originalFilename.contains(".")) {
                    String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
                    if (ALLOWED_EXTENSIONS.contains(ext)) {
                        extension = ext;
                    }
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
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload images. Please try again."));
        }
    }
}
