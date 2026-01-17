# Docker Connection Issues - FIXED

## Issues Found & Fixed

### 1. **Token Storage Mismatch** ✅
**Problem**: Your app stores authentication tokens as `'authToken'` in localStorage, but the API service was looking for `'token'`.

**Fixed in**:
- `src/services/api.ts` - Changed from `localStorage.getItem('token')` to `localStorage.getItem('authToken')`
- `src/services/shipping.ts` - Fixed one instance at line 248

### 2. **Wrong Environment Variable** ✅
**Problem**: Frontend was using React's `process.env.REACT_APP_API_URL` instead of Vite's `import.meta.env.VITE_API_URL`

**Fixed in**:
- `src/services/api.ts` - Changed to use `import.meta.env.VITE_API_URL`

## Apply the Fixes

### Option 1: Rebuild Docker Container (Production)
```bash
cd "/Users/antonswarts/Library/Mobile Documents/com~apple~CloudDocs/Apps/MobileApps/Eduthrift"

# Stop containers
docker-compose down

# Rebuild frontend with the fixes
docker-compose build frontend

# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 2: Use Development Setup (Recommended for Testing)
Much faster for development - no rebuilds needed!

```bash
# 1. Stop production containers
docker-compose down

# 2. Start dev environment (only backend + database in Docker)
./dev-start.sh

# 3. In a new terminal, run frontend locally
cd frontEnd/eduthrift
npm install  # if you haven't already
npm run dev
```

With dev setup:
- Frontend runs locally (instant hot reload)
- Changes apply immediately - no rebuilds
- Can test `npm run build` anytime
- Backend + MySQL run in Docker

Access at: http://localhost:5173 (frontend dev) or http://localhost:8080 (backend)

## Verify the Fix

After rebuilding/restarting:

1. **Open browser console** (F12)
2. **Login to your app**
3. **Check localStorage** - Should see `authToken` key
4. **Navigate to Profile/Cart** - Should load data now
5. **Check Network tab** - API calls should have `Authorization: Bearer <token>` header

## What Was Causing the Error

Your app flow:
1. ✅ User logs in → Backend returns token
2. ✅ Frontend stores token as `'authToken'` in localStorage
3. ❌ User navigates to Profile/Cart → Frontend looks for `'token'` (doesn't exist)
4. ❌ API call made without Authorization header
5. ❌ Backend returns 401 Unauthorized
6. ❌ Frontend shows "No data" or error

Now fixed:
1. ✅ User logs in → Token stored as `'authToken'`
2. ✅ User navigates to Profile/Cart → Frontend finds `'authToken'`
3. ✅ API call includes `Authorization: Bearer <token>`
4. ✅ Backend validates token successfully
5. ✅ Data returned and displayed

## Other Checks

### Backend is Running?
```bash
curl http://localhost:8080/health
# Should return: {"status":"OK","timestamp":"..."}
```

### Frontend Environment Variables?
Check `frontEnd/eduthrift/.env`:
```env
VITE_API_URL=http://localhost:8080
```

### Database Connected?
```bash
docker logs eduthrift-backend | grep "Database connected"
# Should show: Database connected successfully
```

## If Still Having Issues

### 1. Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"

### 2. Clear localStorage
In browser console:
```javascript
localStorage.clear()
```
Then login again.

### 3. Check CORS
Backend allows these origins:
- http://localhost:3000 (Docker frontend)
- http://localhost:5173 (Vite dev)
- http://localhost:8100 (Ionic)

### 4. Check Backend Logs
```bash
docker logs eduthrift-backend --tail 50
```

Look for errors when making API requests.

### 5. Test Backend Directly
```bash
# Login and get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use returned token to test profile
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/auth/profile
```

## Quick Reference

### Production (Docker)
```bash
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose logs -f      # View logs
docker-compose build        # Rebuild
```

### Development (Hybrid)
```bash
./dev-start.sh              # Start backend + DB
cd frontEnd/eduthrift
npm run dev                 # Start frontend
```

### Useful Commands
```bash
# View running containers
docker ps

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# View logs for specific service
docker logs eduthrift-frontend
docker logs eduthrift-backend

# Execute command in container
docker exec -it eduthrift-backend sh
```
