# PayFast Testing & Troubleshooting

## Your Current Setup

✅ **Credentials Location**: `backEnd/.env`
✅ **Merchant ID**: 10044439
✅ **Merchant Key**: 6tpe9qan0pkh7
✅ **Passphrase**: Anton.Swarts101
✅ **URL**: https://sandbox.payfast.co.za/eng/process

## Common PayFast Error Causes

### 1. Return/Cancel URLs Not Configured
PayFast requires you to configure allowed return/cancel URLs in your merchant dashboard.

**Fix**: Login to PayFast sandbox and add these URLs:
- Return URL: `http://localhost:5173/payment/success`
- Return URL: `http://localhost:4173/payment/success`
- Cancel URL: `http://localhost:5173/payment/cancel`
- Cancel URL: `http://localhost:4173/payment/cancel`
- Notify URL: `http://localhost:8080/payments/payfast/notify`

### 2. Signature Mismatch
If your passphrase contains special characters, it might cause signature issues.

**Test without passphrase**:
1. In PayFast dashboard → Settings → Integration
2. Leave passphrase empty (or remove it)
3. Update `backEnd/.env`: `PAYFAST_PASSPHRASE=`
4. Restart backend: `docker-compose restart backend`

### 3. Sandbox vs Production
Make sure you're using **sandbox** credentials with **sandbox** URL.

Your setup is correct (sandbox URL with sandbox credentials).

### 4. Amount Formatting
PayFast requires amounts in ZAR with 2 decimal places (e.g., "100.00" not "100").

This is handled correctly in the code.

## Test the Payment Flow

### Step 1: Test Backend Endpoint

```bash
# Test if backend creates payment URL
curl -X POST http://localhost:8080/payments/payfast \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "orderId": "TEST123",
    "customerEmail": "test@test.com",
    "customerName": "Test User",
    "description": "Test payment"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.payfast.co.za/eng/process?merchant_id=10044439&...",
  "paymentId": "PF_TEST123",
  "message": "PayFast payment initiated"
}
```

### Step 2: Test in Browser

1. **Start your app**: `npm run preview` (in frontEnd/eduthrift)
2. **Add item to cart**
3. **Go to checkout**
4. **Select PayFast payment**
5. **Check browser console** (F12) for errors

### Step 3: Check What's Happening

**If you see "Error Page"**:
- Open Browser DevTools (F12)
- Go to **Network** tab
- Try payment again
- Click on the failed request
- Check the **Response** tab - what does it say?

**If PayFast page loads but shows error**:
- Read the PayFast error message
- Common errors:
  - "Invalid signature" → Passphrase issue or wrong credentials
  - "Merchant not found" → Wrong merchant ID
  - "Invalid URL" → Return/Cancel URLs not configured

## Debug Mode

Add console logging to see what's being sent:

```bash
# Check backend logs while making payment
docker logs -f eduthrift-backend-dev
```

Then try a payment and watch the logs.

## PayFast Sandbox Dashboard

**Login**: https://sandbox.payfast.co.za
**Credentials**: Your PayFast sandbox account

**Things to check**:
1. Go to **Settings** → **Integration**
   - Verify Merchant ID: 10044439
   - Verify Merchant Key: 6tpe9qan0pkh7
   - Check if passphrase is set (should match: Anton.Swarts101)

2. Go to **Settings** → **URLs**
   - Add your return/cancel URLs
   - Add notify URL for IPN

3. Go to **Transactions**
   - See if any test transactions appear

## Quick Fixes

### Fix 1: Remove Passphrase (Simplest)
```bash
# In backEnd/.env, change line 20 to:
PAYFAST_PASSPHRASE=

# Restart backend
docker-compose restart backend
```

Then also remove passphrase from PayFast dashboard.

### Fix 2: Use Default Sandbox Credentials (Test)
```bash
# Temporarily use PayFast's public test credentials
# In backEnd/.env, change to:
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=

# Restart backend
docker-compose restart backend
```

If this works, your credentials might be wrong.

### Fix 3: Check Frontend Error

In your browser console, run:
```javascript
// See what payment service returns
fetch('http://localhost:8080/payments/payfast', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    amount: 100,
    orderId: 'TEST',
    customerEmail: 'test@test.com',
    customerName: 'Test',
    description: 'Test'
  })
}).then(r => r.json()).then(console.log)
```

## What Error Are You Seeing?

Please check:
1. **Error page URL** - What URL shows in browser address bar?
2. **Browser console** - Any JavaScript errors?
3. **Network tab** - What's the response from /payments/payfast?
4. **PayFast page** - Does it load? What error does it show?

This will help me pinpoint the exact issue!
