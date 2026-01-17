#!/bin/bash

echo "=========================================="
echo "Eduthrift Deployment Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the eduthrift directory"
    exit 1
fi

echo "1. Pulling latest code from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Failed to pull latest code"
    exit 1
fi
echo "✅ Code updated"
echo ""

echo "2. Stopping existing containers..."
podman-compose down
echo "✅ Containers stopped"
echo ""

echo "3. Building containers (this may take a few minutes)..."
podman-compose build --no-cache
if [ $? -ne 0 ]; then
    echo "❌ Failed to build containers"
    exit 1
fi
echo "✅ Containers built"
echo ""

echo "4. Starting containers..."
podman-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers"
    exit 1
fi
echo "✅ Containers started"
echo ""

echo "5. Waiting for containers to initialize..."
sleep 15
echo ""

echo "6. Checking container status..."
podman ps -a
echo ""

echo "7. Checking ports..."
ss -tlnp | grep -E ':(80|3000|3001|8080|3306)' || echo "Note: May need sudo to see process names"
echo ""

echo "8. Testing endpoints..."
echo "   - Backend: http://154.65.107.50:8080"
echo "   - Frontend: http://154.65.107.50:3000"
echo "   - Admin: http://154.65.107.50:3001"
echo ""

echo "9. Checking firewall..."
sudo firewall-cmd --list-ports
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "If any service is not accessible:"
echo "  1. Check logs: podman logs eduthrift-<service>"
echo "  2. Check firewall: sudo firewall-cmd --add-port=<port>/tcp --permanent"
echo "  3. Reload firewall: sudo firewall-cmd --reload"
echo ""
