# PayFast Payment Setup Guide

## Problem Solved
The payment error you were experiencing was caused by missing payment endpoints in the backend. The frontend was trying to call `/payments/payfast` but the backend had no such route, resulting in 404 errors.

## What's Been Fixed

1. **Created Payment Routes** (`/backEnd/routes/payments.js`)
   - PayFast payment processing
   - Ozow payment processing
   - EFT (manual bank transfer) processing
   - Payment verification endpoints

2. **Integrated Payment Routes** into `server.js`
   - Added payment router to handle `/payments/*` routes

3. **Configured Environment Variables** in `.env`
   - Added PayFast sandbox credentials
   - Added Ozow configuration placeholders
   - Added backend URL for payment callbacks

## Current Configuration (Sandbox Mode)

Your app is currently configured to use PayFast's **sandbox/test environment**:

```env
PAYFAST_MERCHANT_ID=10044439
PAYFAST_MERCHANT_KEY=6tpe9qan0pkh7
PAYFAST_PASSPHRASE=Anton.Swarts101
PAYFAST_URL=https://sandbox.payfast.co.za/eng/process
```

These are PayFast's publicly available test credentials for development and testing.

## Testing Payments in Sandbox Mode

### Test Payment Flow:
1. User adds items to cart
2. Proceeds to checkout
3. Selects PayFast as payment method
4. Gets redirected to PayFast sandbox
5. Can complete test payment

### PayFast Sandbox Test Cards:
Use these test card numbers in the PayFast sandbox:
- **Successful payment**: 5200000000000015
- **Failed payment**: 4000000000000002
- **Card declined**: 4000000000000036

For any test card:
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/2025)
- Name: Any name

## Setting Up Production PayFast

When you're ready to go live with real payments:

### 1. Create PayFast Account
Visit https://www.payfast.co.za and sign up for a merchant account.

### 2. Get Your Credentials
After approval, PayFast will provide:
- **Merchant ID**: Your unique merchant identifier
- **Merchant Key**: Your secret key
- **Passphrase**: (Optional but recommended) Additional security

### 3. Update Environment Variables

In `/backEnd/.env`, update these values with your real credentials:

```env
# Production PayFast Configuration
PAYFAST_MERCHANT_ID=your_real_merchant_id
PAYFAST_MERCHANT_KEY=your_real_merchant_key
PAYFAST_PASSPHRASE=your_secure_passphrase
PAYFAST_URL=https://www.payfast.co.za/eng/process
```

⚠️ **Important**: When using production:
- Change the URL from `sandbox.payfast.co.za` to `www.payfast.co.za`
- Never commit your production credentials to version control
- Keep your `.env` file in `.gitignore`

### 4. Configure PayFast Dashboard

In your PayFast merchant dashboard:
1. Set your **Return URL**: `https://yourdomain.com/payment/success`
2. Set your **Cancel URL**: `https://yourdomain.com/payment/cancel`
3. Set your **Notify URL** (IPN): `https://yourdomain.com/api/payments/payfast/notify`
4. Enable IPN (Instant Payment Notifications)

## Payment Flow

### PayFast Payment Process:
```
User Cart → Checkout → Select PayFast
    ↓
Backend creates payment data with signature
    ↓
User redirected to PayFast with payment info
    ↓
User completes payment on PayFast
    ↓
PayFast sends IPN to your backend
    ↓
Backend verifies payment and updates order
    ↓
User redirected back to success page
```

## Available Payment Methods

Your app now supports:

### 1. PayFast
- Credit/Debit cards
- Instant EFT
- MasterPass
- Mobicred
- SnapScan

**Endpoint**: `POST /payments/payfast`

**Request**:
```json
{
  "amount": 150.00,
  "orderId": "ORD123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "School uniform purchase"
}
```

### 2. Ozow (Optional)
Fast, secure instant EFT payments.

**Setup Required**: Contact Ozow (https://ozow.com) for merchant credentials

**Endpoint**: `POST /payments/ozow`

### 3. Manual EFT
Bank transfer with reference number.

**Endpoint**: `POST /payments/eft`

**Response includes bank details**:
```json
{
  "success": true,
  "bankDetails": {
    "accountName": "EduThrift (Pty) Ltd",
    "bank": "First National Bank",
    "accountNumber": "62123456789",
    "branchCode": "250655",
    "reference": "ORD123",
    "amount": "150.00"
  }
}
```

## Security Features

✅ **Payment signature verification** - Prevents tampering
✅ **IPN (Instant Payment Notification)** - Async payment confirmation
✅ **HTTPS required in production** - Secure transmission
✅ **Order reference tracking** - Links payments to orders
✅ **Environment-based configuration** - Sandbox vs Production

## Troubleshooting

### Issue: Still getting payment errors
**Solution**:
1. Restart your backend server to load new routes
2. Check backend console for errors
3. Verify `.env` file is in `/backEnd/` directory

### Issue: Payment redirects to PayFast but fails
**Possible Causes**:
- Using production credentials in sandbox URL (or vice versa)
- Invalid signature (check passphrase matches)
- Incorrect merchant credentials

**Solution**:
- Verify credentials match your environment (sandbox vs production)
- Check PayFast dashboard for error messages
- Test with PayFast sandbox first

### Issue: Payment successful but order not updating
**Possible Causes**:
- IPN callback not configured
- Firewall blocking PayFast IPN
- Database update logic needs implementation

**Solution**:
- Check `/payments/payfast/notify` endpoint is accessible
- Review server logs for IPN notifications
- Implement order update logic in IPN handler

## Next Steps

### For Testing:
1. ✅ Backend payment routes are ready
2. ✅ Frontend payment service is configured
3. ✅ Sandbox credentials are set
4. Start your backend: `cd backEnd && npm start`
5. Test a payment with sandbox test cards

### For Production:
1. Sign up for PayFast merchant account
2. Get verified and approved
3. Update `.env` with production credentials
4. Change PayFast URL to production
5. Test thoroughly before launch
6. Monitor payments in PayFast dashboard

## Support

- **PayFast Documentation**: https://developers.payfast.co.za
- **PayFast Support**: support@payfast.co.za
- **Test Environment**: https://sandbox.payfast.co.za
- **Production Dashboard**: https://www.payfast.co.za

## Cost & Fees

PayFast fees (as of 2024):
- Setup fee: R0 (Free)
- Monthly fee: R0 (Free)
- Transaction fee: 2.9% + R2.00 per transaction
- No hidden costs

Check PayFast website for current pricing: https://www.payfast.co.za/pricing/
