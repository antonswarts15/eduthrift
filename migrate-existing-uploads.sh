#!/bin/bash
# migrate-existing-uploads.sh
# Run this ONCE to migrate existing uploads to the persistent volume

set -e

echo "=== Eduthrift Uploads Migration Script ==="
echo "This will migrate existing uploads to persistent Docker volume"
echo ""

# Check if backend container is running
if ! docker ps | grep -q eduthrift-backend; then
    echo "ERROR: Backend container is not running"
    echo "Please start the containers first: docker-compose up -d"
    exit 1
fi

# Create temporary backup
echo "Step 1: Creating backup of current uploads..."
BACKUP_DIR="/tmp/eduthrift-uploads-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy uploads from container to backup
docker cp eduthrift-backend:/app/uploads "$BACKUP_DIR/" 2>/dev/null || {
    echo "No existing uploads found in container, skipping backup"
}

# Check if volume has data
echo "Step 2: Checking persistent volume..."
VOLUME_HAS_DATA=$(docker run --rm -v backend_uploads:/data alpine ls /data 2>/dev/null | wc -l)

if [ "$VOLUME_HAS_DATA" -gt 0 ]; then
    echo "WARNING: Persistent volume already contains data"
    read -p "Do you want to overwrite it? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Migration cancelled"
        exit 0
    fi
fi

# Copy backup to persistent volume
if [ -d "$BACKUP_DIR/uploads" ]; then
    echo "Step 3: Copying uploads to persistent volume..."
    docker run --rm \
        -v backend_uploads:/data \
        -v "$BACKUP_DIR/uploads":/backup \
        alpine sh -c "cp -r /backup/* /data/ && chmod -R 755 /data"
    
    echo "Step 4: Verifying migration..."
    FILE_COUNT=$(docker run --rm -v backend_uploads:/data alpine find /data -type f | wc -l)
    echo "Migrated $FILE_COUNT files to persistent volume"
else
    echo "No uploads to migrate"
fi

# Restart backend to use persistent volume
echo "Step 5: Restarting backend container..."
docker-compose restart backend

echo ""
echo "=== Migration Complete ==="
echo "Backup location: $BACKUP_DIR"
echo "Persistent volume: backend_uploads"
echo ""
echo "To verify uploads are working:"
echo "1. Upload a new image"
echo "2. Run: docker-compose restart backend"
echo "3. Check if the image still loads"
echo ""
echo "Keep the backup for 7 days, then delete: rm -rf $BACKUP_DIR"
