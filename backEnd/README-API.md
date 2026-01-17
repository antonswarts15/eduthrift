# Eduthrift Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
```bash
mysql -u root -p < database/init.sql
```

3. Configure environment variables in `.env`:
```
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eduthrift
JWT_SECRET=your-secret-key
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (requires auth)
- `PUT /auth/profile` - Update user profile (requires auth)

### Items
- `GET /items` - Get items with filters
- `POST /items` - Create new item (requires auth)
- `PUT /items/:id` - Update item (requires auth)
- `DELETE /items/:id` - Delete item (requires auth)

### Cart
- `POST /cart` - Add item to cart (requires auth)
- `GET /cart` - Get cart items (requires auth)
- `DELETE /cart/:itemId` - Remove from cart (requires auth)

### Orders
- `POST /orders` - Create order (requires auth)
- `GET /orders` - Get user orders (requires auth)

### Schools
- `GET /schools` - Get all schools
- `GET /schools/nearby` - Get nearby schools

### File Upload
- `POST /upload/images` - Upload item images (requires auth)

## Security Features

- JWT authentication
- Input sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation