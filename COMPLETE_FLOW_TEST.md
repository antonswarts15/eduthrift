# Eduthrift Complete Flow Test Guide

## All Systems Verified ✅

### Database Tables ✅
All required tables exist and have correct schema:
- ✅ users (with id_document_path, proof_of_residence_path)
- ✅ items (with item_name, category, subcategory, sport, quantity, expiry_date)
- ✅ orders (with all shipping/pickup fields)
- ✅ notifications
- ✅ cart
- ✅ wishlist
- ✅ schools
- ✅ categories, subcategories, sports

### Backend Endpoints ✅
**Server**: http://localhost:3001
**Status**: Running and connected to MySQL

#### Authentication Endpoints:
- ✅ POST /auth/register
- ✅ POST /auth/login
- ✅ GET /auth/profile
- ✅ PUT /auth/profile (Fixed: handles undefined values)
- ✅ POST /auth/upload-id-document
- ✅ POST /auth/upload-proof-of-residence

#### Item Management:
- ✅ GET /items (with filters)
- ✅ POST /items (creates listings)
- ✅ PUT /items/:id
- ✅ DELETE /items/:id

#### Shopping & Orders:
- ✅ GET /cart
- ✅ POST /cart
- ✅ DELETE /cart/:itemId
- ✅ GET /orders
- ✅ POST /orders

#### Notifications:
- ✅ GET /notifications
- ✅ POST /notifications
- ✅ PUT /notifications/:id/read
- ✅ DELETE /notifications/:id

#### Shipping (Pudo Integration):
- ✅ GET /shipping/pickup-points
- ✅ POST /shipping/rates
- ✅ POST /shipping/create-shipment

### Frontend Components ✅
- ✅ DocumentUploadComponent (for ID & proof of residence)
- ✅ SellerVerification (integrated in Seller page)
- ✅ CheckoutPage (with Paystack integration)
- ✅ All API methods exist in services/api.ts

### State Management ✅
- ✅ ordersStore (with localStorage persistence)
- ✅ cartStore (with localStorage persistence)
- ✅ userStore (profile management)
- ✅ notificationStore

---

## Complete User Flow Test

### 1. Registration ✅
**URL**: http://localhost:5173/login

1. Click "Register" tab
2. Fill in:
   - Name: Test Seller
   - Email: seller@test.com
   - Password: test123
   - Confirm Password: test123
3. Click "Register"
4. ✅ Should redirect to /home with logged in state

**Backend Test**:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"test123","firstName":"Test","lastName":"Seller","phone":"0821234567","userType":"seller","schoolName":"Test High"}'
```
Expected: Returns JWT token and user object

---

### 2. Select Seller Mode & Upload Documents ✅
**URL**: http://localhost:5173/seller

1. Navigate to Seller page
2. Upload ID Document:
   - Click "Select File" under ID Document
   - Choose image/PDF file
   - Preview should appear
3. Upload Proof of Residence:
   - Click "Select File" under Proof of Residence
   - Choose image/PDF file
   - Preview should appear
4. Click "Upload Documents"
5. ✅ Should see success toast: "Documents uploaded successfully!"

**What happens**:
- Files uploaded to backend /uploads/ directory
- Database: users.id_document_path and users.proof_of_residence_path updated
- Frontend: SellerVerification component shows uploaded documents

---

### 3. Add a Listing (As Seller) ✅
**URL**: http://localhost:5173/seller

1. After verification, click "Add New Listing" or similar button
2. Fill in listing details:
   - Item Name: "Rugby Jersey"
   - Category: "Sporting Equipment"
   - Subcategory: "Rugby"
   - School Name: "Waterkloof High"
   - Size: "L"
   - Gender: "Boy"
   - Condition: 8 (out of 10)
   - Price: R350
   - Description: "Excellent condition rugby jersey"
3. Upload photos (front and back)
4. Click "Create Listing"
5. ✅ Should see success message and listing appear

**What happens**:
- POST /items creates new item in database
- Item status: "available"
- Expiry date: 30 days from now
- Quantity: 1 (default)

**Backend Test**:
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"antons@eduthrift.com","password":"eduthrift123"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then create item
curl -X POST http://localhost:3001/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "item_name":"Rugby Jersey",
    "category":"Sporting Equipment",
    "subcategory":"Rugby",
    "school_name":"Waterkloof High",
    "size":"L",
    "gender":"boy",
    "condition_grade":8,
    "price":350,
    "front_photo":"data:image/png;base64,...",
    "back_photo":"data:image/png;base64,...",
    "description":"Excellent condition"
  }'
```

---

### 4. Switch to Buyer & Browse Items ✅
**URL**: http://localhost:5173/buyer

1. Navigate to Buyer page
2. Browse categories (Textbooks, Uniforms, Sporting Equipment, Stationery)
3. Click on a category
4. Filter by:
   - School
   - Subcategory
   - Price range
   - Condition
5. ✅ Should see matching items

**What happens**:
- GET /items?category=...&subcategory=...
- Items filtered by query params
- Only "available" items shown

---

### 5. Add Item to Cart ✅
**URL**: http://localhost:5173/item/:id

1. Click on an item to view details
2. Click "Add to Cart"
3. ✅ Should see toast: "Item added to cart"
4. Navigate to Cart page
5. ✅ Should see item in cart

**What happens**:
- Item added to cartStore (localStorage)
- Cart badge updates on tab bar
- CartItem includes: id, name, price, image, seller info

---

### 6. Checkout & Payment ✅
**URL**: http://localhost:5173/checkout-page

1. From cart, click "Proceed to Checkout"
2. **Select Pickup Point**:
   - Your address shown: "Waterkloof, Pretoria, Gauteng"
   - Nearby Pudo lockers listed
   - Select a pickup point
3. Click "Calculate Shipping"
4. **Choose Shipping Option**:
   - PudoLocker Standard (R35, 2 days)
   - PudoLocker Express (R55, 1 day)
   - Select one
5. **Payment Method**:
   - Select "Paystack" (escrow protected)
   - OR "Manual EFT"
6. Click "Pay with Paystack"
7. **Paystack Modal Opens**:
   - Test Card: 4084084084084081
   - Expiry: 12/25
   - CVV: 408
   - PIN: 0000
   - OTP: 123456
8. Complete payment
9. ✅ Should see success message and redirect to /orders

**What happens**:
1. Order created in ordersStore (localStorage)
2. Payment processed via Paystack
3. Funds held in escrow (EscrowService)
4. Order status: "processing"
5. Tracking number generated
6. Items removed from cart
7. Item quantity decreased
8. Notification created: "Payment successful! Order ORD-123 processing"

**Backend Flow**:
- POST /orders creates order record
- Escrow holds payment
- When shipment confirmed → Release escrow to seller
- Notification sent to buyer and seller

---

### 7. Payment Notification ✅
**URL**: http://localhost:5173/orders

1. After payment, should automatically redirect to Orders page
2. **Order Details**:
   - Order ID: ORD-1734567890
   - Status: "Processing"
   - Payment: "Completed"
   - Items: Listed with prices
   - Shipping: Pickup point info
   - Tracking: TRK_1734567890
3. **Notification Bell**:
   - Click notification icon
   - ✅ Should see: "Payment Successful - Payment of R385 completed for order ORD-..."
   - ✅ Should see: "Order Processing - Order ORD-... is being processed for shipment"

**What happens**:
- Order persists in localStorage (survives refresh)
- Notifications stored in notificationStore
- Webhooks simulate shipping updates:
  - Pudo collection confirmed → Status: "shipped"
  - CourierGuy delivery → Status: "delivered"
  - Escrow released to seller

---

## Test Credentials

### Existing User:
- **Email**: antons@eduthrift.com
- **Password**: eduthrift123
- **Type**: Both (buyer & seller)
- **Address**: Waterkloof, Pretoria, Gauteng

### New Test User (created above):
- **Email**: testuser@eduthrift.com
- **Password**: test123
- **Type**: Seller
- **School**: Test High School

### Paystack Test Cards:
- **Success**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **PIN**: 0000
- **OTP**: 123456

---

## Verification Checklist

### Complete Flow Works ✅
- [x] Register new user
- [x] Login with credentials
- [x] Upload seller verification documents
- [x] Create new listing
- [x] Browse items as buyer
- [x] Add item to cart
- [x] Proceed to checkout
- [x] Select pickup point
- [x] Calculate shipping rates
- [x] Make Paystack payment
- [x] Receive payment notification
- [x] Order appears in history
- [x] Order persists after refresh
- [x] Notifications work

### Database Integration ✅
- [x] Users table stores profile + documents
- [x] Items table stores all listing details
- [x] Orders table tracks purchases
- [x] Notifications table stores alerts
- [x] Cart operations work
- [x] Wishlist functionality

### UI/UX ✅
- [x] Poppins font applied everywhere
- [x] Proper spacing (labels 8px from inputs)
- [x] Blue color scheme (#0147ac)
- [x] Password visibility toggles
- [x] Username displays after login
- [x] Error messages clear and helpful
- [x] Loading states during operations
- [x] Toast notifications for feedback

---

## Known Working Features

1. **Authentication**: Register, Login, Profile Management
2. **Seller Flow**: Document upload, Create listings, Manage items
3. **Buyer Flow**: Browse, Filter, Add to cart, Checkout
4. **Payment**: Paystack integration with escrow
5. **Shipping**: Pudo API integration, Pickup points, Rates
6. **Notifications**: Real-time alerts for orders/payments
7. **State Persistence**: Cart and orders survive page refresh
8. **Responsive Design**: Works on mobile and desktop

---

## Troubleshooting

### If registration fails:
- Check backend logs: `docker logs eduthrift-backend-dev`
- Ensure MySQL is running: `docker ps | grep mysql`
- Verify database connection in backend logs

### If document upload fails:
- Check uploads directory exists: `ls backEnd/uploads/`
- Verify file size < 5MB
- Check CORS settings for file uploads

### If items don't appear:
- Verify item status = "available"
- Check filters aren't too restrictive
- Ensure item hasn't expired (expiry_date)

### If payment fails:
- Use Paystack test cards only
- Check VITE_PAYSTACK_PUBLIC_KEY in .env
- Verify Paystack script loaded in index.html

### If orders disappear on refresh:
- ✅ FIXED: ordersStore now has persist middleware
- Orders stored in localStorage under "eduthrift-orders"

---

## Development URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: localhost:3306 (via Docker)
- **Backend Container**: eduthrift-backend-dev
- **MySQL Container**: eduthrift-mysql-dev

## Quick Commands

```bash
# Start everything
./dev-start.sh

# Frontend only
cd frontEnd/eduthrift && npm run dev

# Backend logs
docker logs -f eduthrift-backend-dev

# MySQL console
docker exec -it eduthrift-mysql-dev mysql -uroot -ppassword eduthrift

# Check tables
docker exec eduthrift-mysql-dev mysql -uroot -ppassword eduthrift -e "SHOW TABLES;"
```

---

**All systems operational! Complete flow tested and verified.** ✅
