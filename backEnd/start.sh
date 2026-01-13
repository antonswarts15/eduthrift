#!/bin/bash

# Start Docker Desktop if not running
if ! docker info > /dev/null 2>&1; then
    echo "Starting Docker Desktop..."
    open -a Docker
    echo "Waiting for Docker to start..."
    while ! docker info > /dev/null 2>&1; do
        sleep 2
    done
fi

# Start services
echo "Starting MySQL and Backend..."
docker-compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 15

# Test API
echo "Testing API..."
curl http://localhost:8081/api/health