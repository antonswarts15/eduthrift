#!/bin/bash

echo "=========================================="
echo "Eduthrift Container Diagnostics"
echo "=========================================="
echo ""

echo "1. Checking running containers:"
podman ps -a
echo ""

echo "2. Checking admin container logs (last 50 lines):"
podman logs --tail 50 eduthrift-admin
echo ""

echo "3. Checking backend container logs (last 50 lines):"
podman logs --tail 50 eduthrift-backend
echo ""

echo "4. Checking frontend container logs (last 50 lines):"
podman logs --tail 50 eduthrift-frontend
echo ""

echo "5. Checking MySQL container logs (last 50 lines):"
podman logs --tail 50 eduthrift-mysql
echo ""

echo "6. Checking listening ports:"
ss -tlnp | grep -E ':(80|3001|3306|5173|5174)'
echo ""

echo "7. Checking firewall status:"
sudo firewall-cmd --list-all
echo ""

echo "=========================================="
echo "Diagnostics complete"
echo "=========================================="
