# Eduthrift Backend

## Quick Start with Docker

1. **Start backend and database:**
```bash
cd backend
docker-compose up -d
```

2. **Access services:**
- Backend API: http://localhost:3001
- MySQL: localhost:3306

3. **Test API:**
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/categories
```

4. **Stop services:**
```bash
docker-compose down
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/categories` - All categories
- `GET /api/categories/{id}/item-types` - Item types by category
- `GET /api/items` - Items with filters

## Database

MySQL with normalized schema:
- categories → subcategories → item_types → items
- Proper linking tables for relationships
- Sample data included