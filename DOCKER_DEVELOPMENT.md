# Docker Development Setup

This guide explains how to use Docker for development without constantly rebuilding containers.

## Setup Overview

- **Frontend**: Runs locally on your machine (not in Docker)
- **Backend**: Runs in Docker with live code reloading
- **MySQL**: Runs in Docker

## Getting Started

### 1. Start Backend & Database Services

```bash
# Start only the backend and database
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. Run Frontend Locally

Navigate to the frontend directory and run:

```bash
cd frontEnd/eduthrift

# Install dependencies (first time only)
npm install

# Development mode (hot reload)
npm run dev

# Production build (to test)
npm run build

# Preview production build
npm run preview
```

## Development Workflow

### Frontend Development
- Make changes to your code in `frontEnd/eduthrift/src`
- Vite dev server automatically reloads changes
- Access at http://localhost:5173 (or port shown in terminal)

### Testing Production Build
```bash
cd frontEnd/eduthrift
npm run build
npm run preview
```

### Backend Development
- Make changes to your code in `backEnd/`
- Nodemon automatically restarts the server
- Backend runs at http://localhost:8080

### Database Access
- MySQL runs at localhost:3306
- Credentials:
  - Database: `eduthrift`
  - User: `eduthrift_user`
  - Password: `eduthrift_pass`
  - Root password: `password`

## Useful Commands

### Docker Commands
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (resets database)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild backend container
docker-compose -f docker-compose.dev.yml up -d --build backend

# View backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Access MySQL CLI
docker exec -it eduthrift-mysql-dev mysql -u eduthrift_user -peduthrift_pass eduthrift
```

### Frontend Commands
```bash
cd frontEnd/eduthrift

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
tsc --noEmit

# Linting
npm run lint
```

## Production Deployment

When ready to deploy, use the production docker-compose:

```bash
# Build and start all services (including frontend in nginx)
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running: `docker-compose -f docker-compose.dev.yml ps`
- Check backend logs: `docker-compose -f docker-compose.dev.yml logs backend`
- Verify CORS settings allow your frontend URL

### Backend not reloading changes
- Check if nodemon is running: `docker-compose -f docker-compose.dev.yml logs backend`
- Restart backend: `docker-compose -f docker-compose.dev.yml restart backend`

### Database connection issues
- Wait for database to be healthy: `docker-compose -f docker-compose.dev.yml ps`
- Check MySQL logs: `docker-compose -f docker-compose.dev.yml logs mysql`

### Port conflicts
- If ports 3306 or 8080 are in use, stop conflicting services
- Or modify ports in docker-compose.dev.yml

## Environment Variables

### Frontend (.env in frontEnd/eduthrift/)
```env
VITE_API_URL=http://localhost:8080
```

### Backend (configured in docker-compose.dev.yml)
- DB_HOST=mysql
- DB_PORT=3306
- JWT_SECRET=docker-jwt-secret-key-change-in-production
- PORT=8080

## Benefits of This Setup

✅ **Fast Development**: No container rebuilds needed
✅ **Hot Reload**: Both frontend and backend reload on changes
✅ **Production Testing**: Run `npm run build` anytime to test production builds
✅ **Isolated Database**: MySQL in Docker, easy to reset
✅ **Native Performance**: Frontend runs at native speed on your machine
