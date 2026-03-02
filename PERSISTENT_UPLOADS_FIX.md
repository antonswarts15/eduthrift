# CRITICAL: Persistent Uploads Storage Setup

## Problem
The `uploads/` directory is being deleted on every new build/deployment, causing all uploaded images to disappear.

## Solution: External Persistent Storage

### Option 1: Docker Volume (Recommended for Docker deployments)

Update your `docker-compose.yml`:

```yaml
services:
  backend:
    image: your-backend-image
    volumes:
      - uploads-data:/app/uploads  # Persistent volume
    environment:
      - FILE_UPLOAD_DIR=/app/uploads

volumes:
  uploads-data:
    driver: local
```

### Option 2: Host Directory Mount

```yaml
services:
  backend:
    volumes:
      - /var/eduthrift/uploads:/app/uploads  # Mount host directory
```

Then create the directory on host:
```bash
sudo mkdir -p /var/eduthrift/uploads/items
sudo chown -R 1000:1000 /var/eduthrift/uploads
sudo chmod -R 755 /var/eduthrift/uploads
```

### Option 3: Cloud Storage (Best for Production)

Use AWS S3, Google Cloud Storage, or Azure Blob Storage.

#### AWS S3 Implementation:

1. Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>
```

2. Update `application.properties`:
```properties
aws.s3.bucket.name=${AWS_S3_BUCKET:eduthrift-uploads}
aws.s3.region=${AWS_REGION:af-south-1}
aws.access.key=${AWS_ACCESS_KEY}
aws.secret.key=${AWS_SECRET_KEY}
```

3. Create S3 service:
```java
@Service
public class S3StorageService {
    @Value("${aws.s3.bucket.name}")
    private String bucketName;
    
    private final AmazonS3 s3Client;
    
    public String uploadFile(MultipartFile file, String folder) {
        String key = folder + "/" + UUID.randomUUID() + getExtension(file);
        s3Client.putObject(bucketName, key, file.getInputStream(), null);
        return s3Client.getUrl(bucketName, key).toString();
    }
}
```

### Option 4: NFS/Network Storage

Mount network storage:
```bash
sudo mount -t nfs server:/exports/uploads /app/uploads
```

Add to `/etc/fstab` for persistence:
```
server:/exports/uploads /app/uploads nfs defaults 0 0
```

## GitHub Actions Deployment Fix

Update your deployment workflow to preserve uploads:

```yaml
- name: Deploy Backend
  run: |
    # Backup uploads before deployment
    ssh user@server "mkdir -p /tmp/uploads-backup"
    ssh user@server "cp -r /app/uploads/* /tmp/uploads-backup/ || true"
    
    # Deploy new version
    docker-compose pull
    docker-compose up -d
    
    # Restore uploads if needed
    ssh user@server "cp -r /tmp/uploads-backup/* /app/uploads/ || true"
```

## Immediate Fix for Current Deployment

SSH into your server and run:

```bash
# Create persistent directory outside container
sudo mkdir -p /var/eduthrift/uploads/items
sudo mkdir -p /var/eduthrift/uploads/id-documents
sudo mkdir -p /var/eduthrift/uploads/proof-of-residence

# Set permissions
sudo chown -R 1000:1000 /var/eduthrift/uploads
sudo chmod -R 755 /var/eduthrift/uploads

# Update docker-compose.yml to mount this directory
# Then restart containers
docker-compose down
docker-compose up -d
```

## Recommended Production Setup

1. **Use S3 or equivalent cloud storage** - Most reliable
2. **Set up automated backups** of uploads directory
3. **Use CDN** (CloudFront, CloudFlare) for serving images
4. **Implement image optimization** before upload

## Quick Migration Script

```bash
#!/bin/bash
# migrate-to-persistent-storage.sh

# Backup current uploads
docker cp backend-container:/app/uploads /tmp/uploads-backup

# Create persistent volume
docker volume create uploads-data

# Copy data to volume
docker run --rm -v uploads-data:/data -v /tmp/uploads-backup:/backup alpine \
  sh -c "cp -r /backup/* /data/"

# Update docker-compose.yml and restart
docker-compose down
docker-compose up -d

echo "Migration complete. Uploads are now persistent."
```

## Verification

After setup, verify persistence:

```bash
# Upload a test image
# Restart container
docker-compose restart backend
# Check if image still exists
curl https://api.eduthrift.co.za/uploads/items/test-image.jpg
```

## Environment Variables

Set in production:
```bash
FILE_UPLOAD_DIR=/app/uploads  # For Docker volume
# OR
FILE_UPLOAD_DIR=/var/eduthrift/uploads  # For host mount
# OR
USE_S3_STORAGE=true  # For cloud storage
```
