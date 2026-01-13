# Eduthrift Docker Setup

## Quick Start

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MySQL: localhost:3306

## Services

- **Frontend**: Ionic React app with Nginx (Port 3000)
- **Backend**: Node.js/Express API (Port 3001)
- **Database**: MySQL 8.0 with sample data (Port 3306)

## Development Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## Database Access

```bash
# Connect to MySQL
docker exec -it eduthrift-mysql mysql -u eduthrift_user -p eduthrift

# Or as root
docker exec -it eduthrift-mysql mysql -u root -p
```

## File Structure

```
Eduthrift/
├── docker-compose.yml          # Main compose file
├── frontEnd/
│   ├── Dockerfile.frontend     # Frontend build
│   └── docker-compose.yml      # Frontend-only setup
└── backEnd/
    ├── Dockerfile              # Backend build
    └── docker-compose.yml      # Backend-only setup
```

## Environment Variables

Backend environment variables are configured in docker-compose.yml:
- `DB_HOST=mysql`
- `DB_USER=eduthrift_user`
- `DB_PASSWORD=eduthrift_pass`
- `JWT_SECRET=docker-jwt-secret-key`

## Volumes

- `mysql_data`: Persistent MySQL data
- `backend_uploads`: Uploaded item images