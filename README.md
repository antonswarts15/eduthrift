# Eduthrift - Educational Marketplace

A marketplace for buying and selling educational items including textbooks, uniforms, sports equipment, and stationery.

## Project Structure

```
Eduthrift/
├── frontEnd/          # Ionic React frontend + Docker files
└── backend/           # Node.js Express API
```

## Quick Start with Docker

1. **Start all services (from project root):**
```bash
# Using the startup script (recommended)
./start-services.sh

# Or manually
docker-compose up --build -d
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MySQL: localhost:3306

## Services

- **Frontend**: Ionic React app with Nginx
- **Backend**: Node.js/Express API with MySQL
- **Database**: MySQL 8.0 with sample data

## Development

```bash
# Start services (from project root)
docker-compose up --build -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

## OAuth Setup

To enable Google and Facebook authentication, see [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed configuration instructions.

**Quick Setup:**
1. Create Google OAuth credentials
2. Create Facebook app credentials
3. Update environment variables in both frontend and backend `.env` files
4. Restart the application

## Features

- **Multi-category marketplace**: Textbooks, uniforms, sports equipment, stationery
- **School-based filtering**: Items organized by schools
- **Grade phase support**: ECD, Foundation, Intermediate, Senior, FET phases
- **Bilingual support**: English/Afrikaans for subjects
- **Photo upload**: Front and back photos for items
- **Advanced filtering**: Price, condition, grade, school filters
- **Social Authentication**: Login with Google or Facebook accounts
- **Traditional Registration**: Email/password registration for users who prefer not to use social login