package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
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

    private static final long MIN_FILE_SIZE_BYTES = 15_000;  // 15KB — real photos are never smaller
    private static final int  MIN_DIMENSION_PX    = 200;     // 200×200 minimum
    private static final int  PIXEL_SAMPLE_STEP   = 10;      // sample every 10th pixel for speed
    private static final double MIN_VARIANCE       = 100.0;  // below this = solid/near-solid colour

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

                // Reject suspiciously small files — real photos are never < 15KB
                if (image.getSize() < MIN_FILE_SIZE_BYTES) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Image is too small. Please upload a real photo of the item (minimum 15KB)."));
                }

                // Validate image content: dimensions and pixel variance
                String validationError = validateImageContent(image);
                if (validationError != null) {
                    return ResponseEntity.badRequest().body(Map.of("error", validationError));
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

    /**
     * Checks image dimensions and pixel variance.
     * Returns an error message string if the image fails validation, null if it passes.
     * HEIC/HEIF files are skipped (ImageIO cannot decode them on the JVM) — they pass through.
     */
    private String validateImageContent(MultipartFile file) {
        String ct = file.getContentType();
        if (ct != null && (ct.contains("heic") || ct.contains("heif"))) {
            return null; // ImageIO can't decode HEIC — skip pixel checks
        }
        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) {
                return "Could not read image. Please upload a valid photo (jpg, png or webp).";
            }

            int width  = img.getWidth();
            int height = img.getHeight();
            if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
                return "Image is too small (" + width + "×" + height + "px). "
                     + "Please upload a clear photo at least 200×200 pixels.";
            }

            // Sample pixels to compute brightness variance
            // Low variance = near-solid colour = blank/placeholder image
            List<Double> brightness = new ArrayList<>();
            for (int y = 0; y < height; y += PIXEL_SAMPLE_STEP) {
                for (int x = 0; x < width; x += PIXEL_SAMPLE_STEP) {
                    int rgb = img.getRGB(x, y);
                    int r = (rgb >> 16) & 0xFF;
                    int g = (rgb >> 8)  & 0xFF;
                    int b =  rgb        & 0xFF;
                    brightness.add(0.299 * r + 0.587 * g + 0.114 * b);
                }
            }
            double mean     = brightness.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double variance = brightness.stream()
                    .mapToDouble(v -> Math.pow(v - mean, 2))
                    .average().orElse(0);

            if (variance < MIN_VARIANCE) {
                return "Image appears to be blank or a solid colour. "
                     + "Please upload a real photo of the item.";
            }

            return null; // passed all checks
        } catch (IOException e) {
            return "Could not process image. Please try again with a different photo.";
        }
    }
}
