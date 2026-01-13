#!/bin/bash

echo "Starting Eduthrift services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check service health
echo "Checking service health..."

# Check MySQL
if docker-compose exec mysql mysqladmin ping -h localhost -u root -prootpassword --silent; then
    echo "✓ MySQL is running"
else
    echo "✗ MySQL failed to start"
fi

# Check Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✓ Backend API is running"
else
    echo "✗ Backend API failed to start"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend failed to start"
fi

echo ""
echo "Services started! Access the application at:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "MySQL: localhost:3306"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"