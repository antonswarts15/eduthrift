# Paystack Integration Test Guide

## Quick Start

The dev server is running at: **http://localhost:5173/**

## Test Credentials (Paystack Test Mode)

### Test Cards
**Successful Payment:**
- Card Number: `5060666666666666666` or `4084084084084081`
- CVV: `123` or `408`
- Expiry: Any future date (e.g., 12/25)
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card Number: `5060666666666666666`
- CVV: `606`
- OTP: `000000`

## Complete Test Flow

### Step 1: Setup User Profile
1. Navigate to your profile/account settings
2. Ensure you have:
   - Valid email address
   - Complete address (suburb, city, province)
   - Phone number

### Step 2: Add Items to Cart
1. Browse categories (http://localhost:5173/categories)
2. Add at least one item to cart
3. Go to cart page

### Step 3: Checkout Process
1. Click "Checkout" from cart
2. **Select Pickup Point:**
   - System loads nearest pickup points based on your address
   - Select a pickup point (first one is nearest)
3. **Calculate Shipping:**
   - Click "Calculate Shipping"
   - Review shipping rates (Pudo/CourierGuy options)
   - Select preferred shipping method
4. **Select Payment Method:**
   - Choose "Paystack" (for escrow-protected payment)

### Step 4: Complete Paystack Payment
1. Click "Pay with Paystack"
2. Paystack popup will appear
3. Enter test card details
4. Complete OTP verification
5. Payment should succeed

### Step 5: Verify Integration
After successful payment, verify:
- Order created in Orders page
- Order status: "processing"
- Payment status: "completed"
- Escrow status: "funded"
- Tracking number generated
- Items removed from cart
- Notifications created

## What to Watch For

### Console Logs
Open browser DevTools (F12) and check for:
- No errors related to Paystack
- Successful API calls
- Escrow order creation logs

### Expected Flow
1. Order created with status: "pending_payment"
2. Paystack popup opens
3. Payment completed
4. Order status → "processing"
5. Escrow funded with payment reference
6. Shipping simulation starts
7. Redirect to Orders page

## Troubleshooting

### Paystack Popup Doesn't Open
- Check browser console for errors
- Verify VITE_PAYSTACK_PUBLIC_KEY in .env
- Ensure Paystack script loaded (check Network tab)

### Payment Succeeds but Order Not Updated
- Check browser console for callback errors
- Verify escrow service is working
- Check orders store state

### Address/Pickup Point Issues
- Ensure user profile has complete address
- Check if shipping service returns pickup points
- Verify geocoding works for your address

## Environment Variables Check

Your current .env has:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_914bf113c29e4497f7fc3ef86827e3da808c019d
VITE_PAYSTACK_SECRET_KEY=sk_test_207dface7b060ba45aeb64ca6bf273ea8296fbae
VITE_API_URL=http://localhost:8080
```

## Escrow Integration

The payment flow includes escrow protection:
- **Pudo:** Funds released when buyer collects item
- **CourierGuy:** Funds released when item delivered
- Automatic webhook simulation for testing

## Next Steps

After testing, you can:
1. Switch to production keys (remove `_test_` from keys)
2. Test with real ZAR amounts
3. Implement backend webhook handlers
4. Add payment verification endpoint
