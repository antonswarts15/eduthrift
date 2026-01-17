# Eduthrift Daily Startup Guide

## The Problem You Were Having
Every day when you run `dev-start.sh` and then `npm run dev`, you couldn't login. This was because the backend and database were running, but the login credentials weren't set correctly.

## SOLUTION - The Complete Startup Process

### Step 1: Start Backend Services
From the Eduthrift root directory, run:
```bash
./dev-start.sh
```

This script:
- Starts Docker containers for backend (port 8080) and MySQL (port 3306)
- Waits for services to be ready
- Shows service status

**Expected output:**
```
✓ Backend running at http://localhost:8080
✓ MySQL running at localhost:3306
```

### Step 2: Start Frontend
Navigate to frontend directory and start Vite dev server:
```bash
cd frontEnd/eduthrift
npm run dev
```

**Expected output:**
```
VITE v5.2.14  ready in XXXms
➜  Local:   http://localhost:5173/
```

### Step 3: Access Application
Open browser and navigate to: **http://localhost:5173/**

## Login Credentials

### Your Account
```
Email: antons@eduthrift.com
Password: eduthrift123
```

## Troubleshooting Common Issues

### Issue: "Cannot login" or "Invalid credentials"
**Solution:**
1. Check backend is running:
   ```bash
   curl http://localhost:8080/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. Check Docker containers:
   ```bash
   docker ps
   ```
   Should show:
   - eduthrift-backend-dev (port 8080)
   - eduthrift-mysql-dev (port 3306)

3. If containers aren't running:
   ```bash
   cd /Users/antonswarts/Library/Mobile\ Documents/com~apple~CloudDocs/Apps/MobileApps/Eduthrift
   ./dev-start.sh
   ```

### Issue: Frontend won't start
**Solution:**
1. Make sure you're in the correct directory:
   ```bash
   cd frontEnd/eduthrift
   ```

2. If dependencies missing:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Then start dev server:
   ```bash
   npm run dev
   ```

### Issue: Port already in use
**Solution:**
1. Kill existing processes:
   ```bash
   # For backend (port 8080)
   lsof -ti:8080 | xargs kill -9

   # For frontend (port 5173)
   lsof -ti:5173 | xargs kill -9
   ```

2. Restart services

### Issue: Database connection failed
**Solution:**
1. Stop all services:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. Start fresh:
   ```bash
   ./dev-start.sh
   ```

## Verifying Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:8080/health
```
Expected: `{"status":"OK","timestamp":"..."}`

### 2. Test Login API
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"antons@eduthrift.com","password":"eduthrift123"}'
```
Expected: JWT token response

### 3. Check Frontend
Navigate to http://localhost:5173/
- Should see Eduthrift welcome/login page
- Should be able to login with credentials above

## Service Ports Reference

- **Frontend (Vite):** http://localhost:5173
- **Backend API:** http://localhost:8080
- **MySQL Database:** localhost:3306
- **Pudo API (Test):** https://sandbox.pudo.co.za

## Useful Docker Commands

### View all running containers:
```bash
docker ps
```

### View backend logs:
```bash
docker logs eduthrift-backend-dev -f
```

### View MySQL logs:
```bash
docker logs eduthrift-mysql-dev -f
```

### Stop all services:
```bash
docker-compose -f docker-compose.dev.yml down
```

### Restart a specific service:
```bash
docker-compose -f docker-compose.dev.yml restart backend
```

## Quick Start Checklist

- [ ] Run `./dev-start.sh` from Eduthrift root
- [ ] Wait for "Backend running" message
- [ ] `cd frontEnd/eduthrift`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Login with antons@eduthrift.com / eduthrift123
- [ ] Start developing!

## Paystack Integration Testing

After logging in, to test Paystack payment:

1. Add items to cart
2. Go to checkout
3. Select pickup point and shipping
4. Choose Paystack payment
5. Use test card:
   - Card: `5060666666666666666` or `4084084084084081`
   - CVV: `123`
   - Expiry: Any future date
   - PIN: `0000`
   - OTP: `123456`

See `PAYSTACK_TEST_GUIDE.md` for complete testing details.

## Need Help?

- Backend API docs: `/Users/antonswarts/Library/Mobile Documents/com~apple~CloudDocs/Apps/MobileApps/Eduthrift/backEnd/README-API.md`
- Frontend issues: Check browser console (F12)
- Backend issues: Check Docker logs
- Database issues: Connect with `docker exec -it eduthrift-mysql-dev mysql -uroot -ppassword eduthrift`
