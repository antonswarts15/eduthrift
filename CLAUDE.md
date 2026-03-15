# Eduthrift — Claude Context File

This file is the authoritative reference for AI-assisted development on the Eduthrift project. Read it fully before making any changes.

---

## Project Overview

**Eduthrift** is a South African second-hand school uniform and educational equipment marketplace. Sellers list items, buyers purchase them, and funds are held in escrow until delivery is confirmed via PUDO locker collection or CourierGuy delivery.

- **Live domain**: https://eduthrift.co.za
- **API**: https://api.eduthrift.co.za
- **Admin**: https://admin.eduthrift.co.za
- **Server**: AlmaLinux at 154.65.107.50, containers managed with `podman-compose`

---

## Repository Layout

```
Eduthrift/
├── backEnd/eduthriftBackend/   # Spring Boot 3 + Java 17 + Maven
├── frontEnd/eduthrift/         # Ionic React + TypeScript + Vite (mobile app)
├── admin/                      # React admin console
├── docker-compose.yml          # Production compose file
├── .github/workflows/          # CI/CD pipelines
│   ├── backend.yml             # Builds backend image → GHCR
│   ├── build-frontend.yml      # Builds frontend image → GHCR
│   ├── build-admin.yml         # Builds admin image → GHCR
│   └── deploy.yml              # SSH deploys to server after build
└── PERSISTENT_UPLOADS_FIX.md  # Notes on upload volume setup
```

---

## Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Framework | Spring Boot 3 |
| Language | Java 17 |
| Build | Maven (`mvnw`) |
| Database | MySQL 8 (via Spring Data JPA / Hibernate) |
| Auth | JWT (HS256, 24h expiry) via `JwtUtil` + `JwtAuthenticationFilter` |
| File storage | Local filesystem at `/app/uploads` (Docker named volume `backend_uploads`) |
| Container base | `eclipse-temurin:17-jre` |

### Frontend
| Concern | Technology |
|---|---|
| Framework | Ionic 7 + React 18 |
| Language | TypeScript |
| Build | Vite |
| State | Zustand stores + `persist` middleware (localStorage) |
| HTTP | Axios (`src/services/api.ts`) |
| Routing | React Router v5 (`useHistory`, `useLocation`) |

---

## Architecture Patterns — Read These Before Coding

### 1. API Field Naming Convention
**Backend sends snake_case. Frontend uses camelCase internally.**

- `ItemController.toResponse()` maps Java fields → snake_case JSON (`item_name`, `front_photo`, `school_name`)
- `listingsStore.mapBackendItem()` maps snake_case → camelCase `Listing` object
- When adding new fields: add to both `toResponse()` AND `mapBackendItem()`

### 2. Authentication Flow
1. User logs in → `POST /auth/login` → returns `{ token, userType }`
2. Token stored in `localStorage.getItem('authToken')` and `isLoggedIn: 'true'`
3. `authStore.ts` holds in-memory state; `api.ts` interceptor attaches `Authorization: Bearer <token>` to every request
4. On 401/403 (not from login/register): token cleared, redirect to `/login`
5. Logout must call `authStore.logout()` which clears both `authToken` and `isLoggedIn`

### 3. Image Upload Flow
1. Frontend captures image as base64 data URL
2. `listingsStore.addListing()` converts data URLs → `File` objects
3. `POST /upload/images` (multipart) → returns `{ files: [{ url, filename }] }`
4. URLs stored as `/uploads/items/<uuid>.jpg`
5. Images served by `FileController` at `GET /uploads/{type}/{filename}`
6. **Upload directory**: `/app/uploads` inside container, mounted as Docker named volume `backend_uploads` — NEVER use `docker-compose down -v` as it destroys this volume

### 4. Order / Payment / Escrow Flow
1. Buyer selects item → adds to cart (cartStore, persisted in localStorage)
2. Checkout: shipping rates fetched (currently hardcoded mock — Pudo API integration pending)
3. `POST /orders` creates the order with status `PENDING_PAYMENT`
4. `POST /payments/ozow/initiate` → returns payment URL (currently mock — Ozow/EBANX integration pending)
5. Payment gateway calls `POST /payments/ozow/webhook` with status:
   - `CO` → sets `PAYMENT_CONFIRMED`, escrow `HELD`
   - `CA` → sets `CANCELLED`, payment `FAILED`
   - `PE` → sets payment `AUTHORIZED`
6. On delivery: `POST /orders/{orderNumber}/confirm-delivery` → escrow released to seller via `EscrowService`

### 5. Security Config Whitelist
These endpoints are public (no auth required):
- `GET /auth/**` — registration/login
- `GET /categories/**`
- `GET /items/**` — browsing listings
- `GET /item-types/**`
- `GET /uploads/**` — serving uploaded images
- `GET /health` — health check

These require authentication:
- `POST /upload/**` — file uploads
- `POST /orders`, `GET /orders` — order management
- `PUT /auth/profile` — profile updates
- All `/payments/**` endpoints

These require `ADMIN` role:
- All `/admin/**` endpoints

---

## Key Files Reference

### Backend
| File | Purpose |
|---|---|
| `controller/AuthController.java` | Login, register, profile get/update, ID document upload |
| `controller/ItemController.java` | CRUD for listings; `toResponse()` is the field name mapper |
| `controller/UploadController.java` | `POST /upload/images` — multipart image upload |
| `controller/FileController.java` | `GET /uploads/{type}/{filename}` — serve images |
| `controller/OrderController.java` | Order creation, retrieval, status update, delivery confirmation |
| `controller/PaymentController.java` | Ozow/EBANX payment initiation + webhook handler |
| `controller/AdminController.java` | User management, seller verification |
| `controller/HealthController.java` | `GET /health` — checks DB connectivity, returns 503 if down |
| `service/EscrowService.java` | Holds/releases funds on order lifecycle events |
| `security/JwtUtil.java` | JWT generation and validation |
| `security/JwtAuthenticationFilter.java` | Request filter that extracts + validates JWT |
| `config/SecurityConfig.java` | Spring Security rules + CORS origins |
| `config/DataInitializer.java` | Seeds admin/test users on startup (runs every boot) |
| `entity/Order.java` | Order entity with enums: OrderStatus, PaymentStatus, EscrowStatus, PayoutStatus |
| `src/main/resources/application.properties` | All config; values come from environment variables |

### Frontend
| File | Purpose |
|---|---|
| `src/services/api.ts` | Axios instance with auth interceptor + all API endpoint functions |
| `src/stores/authStore.ts` | Auth token state; `login()` / `logout()` |
| `src/stores/userStore.ts` | User profile state; `fetchUserProfile()` |
| `src/stores/listingsStore.ts` | Listings CRUD + image upload logic + `mapBackendItem()` |
| `src/stores/cartStore.ts` | Cart state (persisted to localStorage) |
| `src/stores/ordersStore.ts` | Order state + `fetchOrders()` to sync from backend |
| `src/stores/notificationStore.ts` | In-app notifications (UI only, no backend sync yet) |
| `src/pages/LoginRegisterPage.tsx` | Login + register form |
| `src/pages/CheckoutPage.tsx` | Shipping selection, payment method, order submission |
| `src/components/Categories.tsx` | Main category browser — NOTE: many `onItemSelect` callbacks are no-ops |
| `src/utils/geocoding.ts` | Maps suburb/city/province → lat/lng (hardcoded lookup table) |

---

## Environment Variables

All secrets live in `.env` on the server. **Never commit `.env` files** (they are in `.gitignore`).

### Backend (set in `docker-compose.yml` → passed to Spring Boot)
| Variable | Purpose |
|---|---|
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | HMAC-SHA256 signing key (must be 32+ random chars) |
| `FILE_UPLOAD_DIR` | Upload path inside container (set to `/app/uploads`) |
| `PAYFAST_MERCHANT_ID` | PayFast gateway |
| `PAYFAST_MERCHANT_KEY` | PayFast gateway |
| `PAYFAST_PASSPHRASE` | PayFast gateway |
| `EBANX_INTEGRATION_KEY` | Ozow/EBANX payment key |
| `EBANX_API_URL` | Ozow API base URL |
| `APP_BASE_URL` | Frontend base URL (used in payment redirect/webhook URLs) |
| `PUDO_API_KEY` | PUDO shipping API |
| `PUDO_API_URL` | PUDO shipping API base |
| `SHIPLOGIC_API_KEY` | ShipLogic courier API |

### Frontend (baked into Vite build as `VITE_*`)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL e.g. `https://api.eduthrift.co.za` |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key (for alternative payment flow) |

---

## Deployment

### How it works
1. Push to `main` triggers GitHub Actions build workflows
2. Each workflow builds a Docker image and pushes to GHCR (`ghcr.io/antonswarts15/eduthrift-*:latest`)
3. `deploy.yml` triggers after any successful build, SSHs to the server, and runs:
   ```bash
   cd /opt/eduthrift
   podman-compose pull
   podman-compose up -d --remove-orphans
   ```

### Required GitHub Secrets for deploy
- `DEPLOY_HOST` — server IP/hostname
- `DEPLOY_USER` — SSH username
- `DEPLOY_SSH_KEY` — private SSH key (corresponding public key must be in `~/.ssh/authorized_keys` on server)

### CRITICAL: Preserving Upload Data
- **Always use `podman-compose up -d`** — never `podman-compose down -v`
- The `-v` flag destroys named volumes and wipes all uploaded images
- The `backend_uploads` named volume is the only persistent image storage
- On container start, `entrypoint.sh` runs `mkdir -p` to ensure subdirs exist on the volume

### Server layout
```
/opt/eduthrift/
├── docker-compose.yml   # pulled from repo or manually maintained
└── .env                 # production secrets (never in git)
```

---

## Known Incomplete Features (Do Not Break These Workarounds)

### Payment Integration
- `PaymentController.initiateOzowPayment()` returns a **mock** redirect URL
- The `POST /payments/ozow/webhook` endpoint now correctly updates order status in DB
- **Do not remove** the `TODO` comment or the mock until the real EBANX API call is implemented

### Shipping
- `ShippingService.getPickupPoints()` and `getRates()` return **hardcoded mock data** — Pudo API is not integrated yet
- The Pudo-specific methods (`createPudoShipment`, `getPudoPickupPoints`, etc.) now throw real errors instead of silently succeeding
- `geocoding.ts` uses a hardcoded suburb→coordinates lookup table, not a live geocoding API

### Notifications
- `notificationStore.ts` is in-memory only (no backend persistence)
- The API endpoints `GET /notifications`, `PUT /notifications/:id/read`, `DELETE /notifications/:id` are defined in `api.ts` but **no backend controller exists**

### Wishlist
- `wishlistApi` functions are defined in `api.ts` but **no backend controller exists**

### Categories.tsx `onItemSelect`
- Many category component callbacks only `console.log` in the current codebase
- These are placeholders — implementing real cart/navigation logic is outstanding work

---

## Rules — Always Follow These

### When adding a new API endpoint
1. Add the controller method to the appropriate Java controller
2. Check `SecurityConfig.java` — is it public or authenticated? Update if needed
3. Add the corresponding function to `src/services/api.ts`
4. If it returns items/listings, update `mapBackendItem()` in `listingsStore.ts` if new fields are involved

### When adding new upload types
- Add the new type to `ALLOWED_TYPES` in `FileController.java`
- Create the subdirectory in `entrypoint.sh`

### When changing the Order flow
- Verify all enum values in `Order.java` (OrderStatus, PaymentStatus, EscrowStatus, PayoutStatus)
- Webhook handler in `PaymentController` maps string status codes — update it if payment provider changes
- `EscrowService` is `@Transactional` — keep it that way

### Do NOT do these
- Do not run `podman-compose down -v` — destroys uploaded images
- Do not add `System.out.println()` to backend code — use no logging or add SLF4J
- Do not return exception messages (`e.getMessage()`) in API responses — only generic user-safe messages
- Do not add mock fallbacks that silently succeed on API failure — throw the error
- Do not add `console.log` to frontend — it gets stripped in production builds but makes code noisy
- Do not commit `.env` files — credentials must stay out of git

### Code style
- Backend responses use **snake_case** JSON keys (`item_name`, `front_photo`)
- Frontend TypeScript uses **camelCase** internally (`itemName`, `frontPhoto`)
- The mapping layer is `mapBackendItem()` in `listingsStore.ts` and `toResponse()` in each controller
- Frontend `fetch()` direct calls should only be used in `shipping.ts`; everything else goes through the Axios `api` instance

---

## Database Schema Notes

- `items.item_type_id` is nullable (workaround applied in `ItemController` — do not remove)
- `orders.order_number` is the user-facing ID (format: `ORD-<timestamp>`)
- `users.password_hash` stores BCrypt hash — never store or log plaintext passwords
- `users.verification_status`: `pending` | `verified` | `rejected`
- `users.seller_verified`: boolean — must be `true` before seller can receive payouts

---

## Testing

No automated test suite exists yet. Before deploying changes:
1. Test login + registration
2. Test image upload (create a listing)
3. Test checkout flow end-to-end (even with mock payment)
4. Test admin panel: verify seller, view users
5. Confirm `/health` returns `{"status":"UP","database":"UP"}`

---

## Frequently Broken Things

| Symptom | Likely Cause | Fix |
|---|---|---|
| Uploaded images disappear after deploy | `podman-compose down -v` was used | Restore from backup; recreate volume; use `up -d` only |
| 401 errors on all requests | JWT_SECRET changed between deploys | Users must log in again after secret rotation |
| "Failed to create item" 500 error | `item_type_id` constraint — no ItemTypes in DB | Check `ItemController` fallback creates a default type |
| Frontend shows blank/wrong data | Old cached listings in Zustand store | Refresh page; store fetches from backend on mount |
| Admin panel login fails | User does not have `ADMIN` role | Use `DataInitializer` or directly update `user_type` in DB |
| Payment redirect goes to wrong URL | `APP_BASE_URL` env var not set | Set `APP_BASE_URL=https://eduthrift.co.za` in `.env` |
