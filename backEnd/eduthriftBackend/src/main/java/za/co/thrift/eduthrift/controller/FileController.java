package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

@RestController
@RequestMapping("/uploads")
public class FileController {

    @Value("${file.upload.dir:/app/uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_TYPES = Set.of("items", "id-documents", "proof-of-residence");

    @GetMapping("/{type}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String type, @PathVariable String filename) {
        if (!ALLOWED_TYPES.contains(type)) {
            return ResponseEntity.badRequest().build();
        }
        // Reject any path traversal attempts in the filename
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path file = baseDir.resolve(type).resolve(filename).normalize();
            // Ensure resolved path is still inside the base upload directory
            if (!file.startsWith(baseDir)) {
                return ResponseEntity.badRequest().build();
            }
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg"; // Default
                String lowerFilename = filename.toLowerCase();
                if (lowerFilename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lowerFilename.endsWith(".heic")) {
                    contentType = "image/heic";
                } else if (lowerFilename.endsWith(".heif")) {
                    contentType = "image/heif";
                } else if (lowerFilename.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (lowerFilename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (lowerFilename.endsWith(".pdf")) {
                    contentType = "application/pdf";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
