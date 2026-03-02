# Safe Deployment Procedure (Preserves Uploads)

## CRITICAL: Follow these steps for every deployment

### One-Time Setup (Do this NOW)

1. **Run the migration script on your server:**
   ```bash
   cd /path/to/eduthrift
   ./migrate-existing-uploads.sh
   ```

2. **Verify the persistent volume exists:**
   ```bash
   docker volume ls | grep backend_uploads
   docker volume inspect backend_uploads
   ```

3. **Test persistence:**
   ```bash
   # Upload an image through the app
   # Then restart backend
   docker-compose restart backend
   # Verify image still loads
   ```

### For Every Deployment

The uploads are now safe because:
- ✅ `backend_uploads` is a named Docker volume (persists across deployments)
- ✅ Volume is mounted to `/app/uploads` in container
- ✅ `FILE_UPLOAD_DIR=/app/uploads` environment variable is set

**Standard deployment process:**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart (uploads are preserved automatically)
docker-compose build backend
docker-compose up -d backend

# No special steps needed - volume persists!
```

### GitHub Actions Workflow

Your CI/CD pipeline is safe. The volume persists on the server:

```yaml
- name: Deploy to Production
  run: |
    ssh user@server << 'EOF'
      cd /path/to/eduthrift
      git pull origin main
      docker-compose build backend
      docker-compose up -d backend
      # Uploads volume is automatically preserved
    EOF
```

### Backup Strategy (Recommended)

Add automated backups:

```bash
#!/bin/bash
# backup-uploads.sh - Run daily via cron

BACKUP_DIR="/backups/eduthrift/uploads"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"

# Backup uploads volume
docker run --rm \
  -v backend_uploads:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/uploads-$DATE.tar.gz" -C /data .

# Keep last 30 days
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup complete: uploads-$DATE.tar.gz"
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-uploads.sh
```

### Disaster Recovery

If uploads are lost, restore from backup:

```bash
# Stop backend
docker-compose stop backend

# Restore from backup
docker run --rm \
  -v backend_uploads:/data \
  -v /backups/eduthrift/uploads:/backup \
  alpine sh -c "cd /data && tar xzf /backup/uploads-YYYYMMDD.tar.gz"

# Start backend
docker-compose start backend
```

### Monitoring

Check volume usage:
```bash
docker system df -v | grep backend_uploads
```

Check uploads directory:
```bash
docker exec eduthrift-backend ls -lah /app/uploads/items
```

### Troubleshooting

**Problem: Images still disappearing**
```bash
# Check if volume is mounted
docker inspect eduthrift-backend | grep -A 10 Mounts

# Check FILE_UPLOAD_DIR
docker exec eduthrift-backend env | grep FILE_UPLOAD_DIR

# Check if files are in volume
docker run --rm -v backend_uploads:/data alpine ls -lah /data/items
```

**Problem: Permission denied**
```bash
# Fix permissions in volume
docker run --rm -v backend_uploads:/data alpine chmod -R 755 /data
```

### Production Checklist

- [x] Persistent volume configured in docker-compose.yml
- [x] FILE_UPLOAD_DIR environment variable set
- [x] Migration script executed
- [ ] Automated backups configured
- [ ] Monitoring alerts set up
- [ ] Disaster recovery tested
- [ ] Team trained on deployment process

## Summary

Your uploads are now safe because:
1. Docker named volume `backend_uploads` persists across container rebuilds
2. Volume is properly mounted to `/app/uploads`
3. Application configured to use `/app/uploads`
4. No manual intervention needed during deployments

**The volume survives:**
- ✅ Container restarts
- ✅ Container rebuilds
- ✅ Code deployments
- ✅ Server reboots (if Docker is set to auto-start)

**The volume is lost only if:**
- ❌ You run `docker-compose down -v` (removes volumes)
- ❌ You manually delete the volume: `docker volume rm backend_uploads`
- ❌ Server disk failure (hence the backup strategy)
