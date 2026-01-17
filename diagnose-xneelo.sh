#!/bin/bash

# Eduthrift Xneelo Diagnostic Script
# Run this on your Xneelo server to diagnose deployment issues

echo "🔍 Eduthrift Deployment Diagnostics"
echo "===================================="
echo ""

echo "1️⃣ Checking Podman installation..."
podman --version || echo "❌ Podman not installed"
podman-compose --version || echo "❌ Podman-compose not installed"
echo ""

echo "2️⃣ Checking running containers..."
podman ps
echo ""

echo "3️⃣ Checking all containers (including stopped)..."
podman ps -a
echo ""

echo "4️⃣ Checking container logs..."
echo ""
echo "--- Backend Logs (last 50 lines) ---"
podman logs --tail 50 eduthrift-backend 2>&1 || echo "❌ Backend container not found"
echo ""

echo "--- Frontend Logs (last 20 lines) ---"
podman logs --tail 20 eduthrift-frontend 2>&1 || echo "❌ Frontend container not found"
echo ""

echo "--- Admin Logs (last 20 lines) ---"
podman logs --tail 20 eduthrift-admin 2>&1 || echo "❌ Admin container not found"
echo ""

echo "--- MySQL Logs (last 20 lines) ---"
podman logs --tail 20 eduthrift-mysql 2>&1 || echo "❌ MySQL container not found"
echo ""

echo "5️⃣ Checking port bindings..."
echo "Ports that should be open:"
echo "  - 8080 (Backend)"
echo "  - 3000 (Frontend)"
echo "  - 3001 (Admin)"
echo "  - 3306 (MySQL)"
echo ""
sudo ss -tuln | grep -E ':(8080|3000|3001|3306)' || echo "❌ No ports bound"
echo ""

echo "6️⃣ Checking if backend can connect to MySQL..."
podman exec eduthrift-backend sh -c 'nc -zv mysql 3306' 2>&1 || echo "❌ Backend cannot reach MySQL"
echo ""

echo "7️⃣ Checking SELinux status (AlmaLinux)..."
getenforce || echo "SELinux not available"
echo ""

echo "8️⃣ Checking firewall rules..."
sudo firewall-cmd --list-ports 2>&1 || echo "Firewall not configured or disabled"
echo ""

echo "9️⃣ Testing backend health endpoint internally..."
curl -s http://localhost:8080/health || echo "❌ Backend health check failed"
echo ""

echo "🔟 Checking environment file..."
if [ -f .env.prod ]; then
    echo "✅ .env.prod exists"
    echo "Environment variables set:"
    grep -v "PASSWORD\|SECRET\|KEY" .env.prod || echo "No safe variables to display"
else
    echo "❌ .env.prod not found"
fi
echo ""

echo "===================================="
echo "📋 Diagnostic complete!"
echo ""
echo "Common issues and fixes:"
echo "1. Backend failing to start → Check backend logs for database connection errors"
echo "2. Port 8080 not bound → Backend container crashed, check logs"
echo "3. SELinux blocking → Run: sudo setenforce 0 (temporary)"
echo "4. Database connection failed → Check DB_HOST in .env.prod (should be 'mysql')"
echo "5. Wrong endpoint → Use /health not /actuator/health"
