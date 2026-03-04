package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "https://admin.eduthrift.co.za", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class FileController {

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    @GetMapping("/{type}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String type, @PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(type).resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
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
                System.err.println("File not found: " + file.toAbsolutePath());
                System.err.println("Upload dir: " + uploadDir);
                System.err.println("File exists: " + Files.exists(file));
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.err.println("Malformed URL for file: " + type + "/" + filename);
            return ResponseEntity.badRequest().build();
        }
    }
}
