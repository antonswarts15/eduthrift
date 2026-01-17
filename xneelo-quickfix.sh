#!/bin/bash

# Xneelo Quick Fix Script
# Upload this to your Xneelo server and run it to fix common issues

echo "🔧 Eduthrift Quick Fix for Xneelo/AlmaLinux"
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo "❌ Don't run as root. Run as almalinux user."
   exit 1
fi

cd ~/eduthrift || { echo "❌ ~/eduthrift directory not found"; exit 1; }

echo "1️⃣ Checking current container status..."
podman ps -a
echo ""

echo "2️⃣ Checking backend logs for errors..."
podman logs --tail 30 eduthrift-backend 2>&1 | tail -20
echo ""

echo "3️⃣ Stopping all containers..."
podman-compose down
sleep 3
echo ""

echo "4️⃣ Pulling latest images..."
podman pull ghcr.io/antonswarts15/eduthrift-backend:latest
podman pull ghcr.io/antonswarts15/eduthrift-frontend:latest
podman pull ghcr.io/antonswarts15/eduthrift-admin:latest
echo ""

echo "5️⃣ Starting MySQL first (needs time to initialize)..."
podman-compose up -d mysql
echo "Waiting 15 seconds for MySQL to start..."
sleep 15
echo ""

echo "6️⃣ Checking MySQL is ready..."
podman exec eduthrift-mysql mysqladmin ping -h localhost -u root -prootpassword || {
    echo "❌ MySQL not ready, waiting another 10 seconds..."
    sleep 10
}
echo ""

echo "7️⃣ Starting all services..."
podman-compose up -d
sleep 5
echo ""

echo "8️⃣ Checking container status..."
podman ps
echo ""

echo "9️⃣ Testing backend health endpoint..."
sleep 3
curl -v http://localhost:8080/health || echo "❌ Backend health check failed"
echo ""

echo "🔟 Checking backend logs (last 20 lines)..."
podman logs --tail 20 eduthrift-backend
echo ""

echo "==========================================="
echo "✅ Quick fix complete!"
echo ""
echo "Test your endpoints:"
echo "  Backend:  http://154.65.107.50:8080/health"
echo "  Frontend: http://154.65.107.50:3000"
echo "  Admin:    http://154.65.107.50:3001"
echo ""
echo "If backend still fails, check:"
echo "  1. podman logs eduthrift-backend"
echo "  2. Make sure .env.prod has JWT_SECRET set"
echo "  3. Make sure DB_HOST=mysql (not localhost)"
