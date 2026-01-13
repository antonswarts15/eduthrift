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

### Frontend (Port 3000)
- Ionic React app served by Nginx
- Proxies API calls to backend

### Backend (Port 3001)
- Node.js/Express API
- Handles all business logic
- Connects to MySQL database

### MySQL (Port 3306)
- Database: `eduthrift`
- User: `eduthrift_user`
- Password: `eduthrift_pass`

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

# Access backend container
docker exec -it eduthrift-backend sh

# Access MySQL
docker exec -it eduthrift-mysql mysql -u eduthrift_user -p eduthrift
```

## Database Schema

The database includes:
- `users` - User accounts
- `items` - Listed items (textbooks, uniforms, etc.)
- `orders` - Purchase orders
- `cart` - Shopping cart items
- `schools` - School reference data

## API Endpoints

- `GET /health` - Health check
- `GET /items` - Get items with filters
- `POST /items` - Create new item
- `GET /schools` - Get school list

## Environment Variables

Backend uses these environment variables:
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret