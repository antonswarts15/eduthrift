#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Eduthrift Development Environment...${NC}"

# 1. Start Backend and Database using Docker Compose
echo -e "${GREEN}Starting Backend and Database containers...${NC}"
# We use the existing docker-compose.yml but only start mysql and backend services
docker-compose up -d mysql backend

# 2. Wait for backend to be ready (optional but recommended)
echo -e "${BLUE}Waiting for backend to be ready...${NC}"
# Simple wait loop checking if port 3001 is accessible
until curl -s http://localhost:3001/health > /dev/null; do
  echo "Backend not ready yet... waiting 2 seconds"
  sleep 2
done
echo -e "${GREEN}Backend is up and running!${NC}"

# 3. Start Frontend in Development Mode
echo -e "${GREEN}Starting Frontend in Development Mode...${NC}"
cd frontEnd/eduthrift

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  npm install
fi

# Start the dev server
# We bind to 0.0.0.0 to ensure it's accessible if needed, though localhost is fine for local dev
echo -e "${GREEN}Launching Vite Dev Server...${NC}"
npm run dev

# Cleanup on exit
trap "echo -e '${BLUE}Stopping containers...${NC}'; docker-compose stop" EXIT