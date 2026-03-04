# Ozow Payment Integration Guide

## Overview
This guide explains how to integrate Ozow payments into EduThrift using the modal checkout approach.

## Prerequisites
1. Ozow merchant account (sign up at https://ozow.com)
2. Ozow API credentials:
   - Site Code
   - API Key
   - Private Key

## Configuration

### Backend Configuration (.env)
Add the following to your `backEnd/.env` file:

```env
OZOW_SITE_CODE=your-site-code-here
OZOW_API_KEY=your-api-key-here
OZOW_PRIVATE_KEY=your-private-key-here
OZOW_IS_TEST=true
```

**Important:** 
- Set `OZOW_IS_TEST=true` for sandbox/testing
- Set `OZOW_IS_TEST=false` for production

### Frontend Configuration
The Ozow modal script is already included in `index.html`:
```html
<script src="https://pay.ozow.com/js/iframe/ozow-inline.js"></script>
```

## How It Works

### 1. Payment Flow
```
User clicks "Pay with Ozow" 
  → Backend generates payment URL with hash
  → Frontend opens Ozow modal
  → User completes payment in modal
  → Ozow redirects to success/cancel/error page
  → Ozow sends webhook notification to backend
```

### 2. Hash Generation
The backend generates a SHA512 hash using:
```
SiteCode + CountryCode + CurrencyCode + Amount + TransactionReference + 
BankReference + CancelUrl + ErrorUrl + SuccessUrl + NotifyUrl + 
IsTest + PrivateKey
```

### 3. Payment URLs
- **Success:** `https://www.eduthrift.co.za/payment/success`
- **Cancel:** `https://www.eduthrift.co.za/payment/cancel`
- **Error:** `https://www.eduthrift.co.za/payment/error`
- **Notify (Webhook):** `https://api.eduthrift.co.za/payments/ozow/notify`

## API Endpoints

### POST /payments/ozow/initiate
Initiates an Ozow payment and returns the payment URL.

**Request:**
```json
{
  "amount": 150.00,
  "orderId": "ORD-12345",
  "customerEmail": "buyer@example.com",
  "customerName": "John Doe",
  "description": "Order ORD-12345"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://stagingapi.ozow.com/PostPaymentRequest?...",
  "message": "Ozow payment URL generated"
}
```

### POST /payments/ozow/notify
Webhook endpoint for Ozow payment notifications.

**Ozow sends:**
```json
{
  "SiteCode": "TST-MER-001",
  "TransactionId": "123456",
  "TransactionReference": "ORD-12345",
  "Amount": "150.00",
  "Status": "Complete",
  "Hash": "..."
}
```

**Status values:**
- `Complete` - Payment successful
- `Cancelled` - Payment cancelled by user
- `Error` - Payment failed

## Testing

### Test Credentials
Use Ozow's sandbox environment for testing:
- Base URL: `https://stagingapi.ozow.com`
- Set `OZOW_IS_TEST=true`

### Test Banks
Ozow provides test banks in sandbox:
- **Test Bank Success** - Simulates successful payment
- **Test Bank Failure** - Simulates failed payment
- **Test Bank Cancelled** - Simulates cancelled payment

### Test Flow
1. Add items to cart
2. Proceed to checkout
3. Select Ozow payment
4. Click "Pay with Ozow"
5. Modal opens with Ozow payment page
6. Select a test bank
7. Complete payment
8. Verify redirect to success page
9. Check backend logs for webhook notification

## Security

### Hash Verification
The backend verifies all webhook notifications by:
1. Reconstructing the hash from received data
2. Comparing with the hash sent by Ozow
3. Rejecting requests with invalid hashes

### HTTPS Required
- All URLs (success, cancel, error, notify) must use HTTPS in production
- Ozow will reject HTTP URLs

## Troubleshooting

### Modal Not Opening
- Check browser console for errors
- Verify Ozow script is loaded: `window.OzowCheckout`
- Fallback to redirect if modal fails

### Payment Not Completing
- Check Ozow credentials in .env
- Verify hash generation matches Ozow's requirements
- Check backend logs for errors

### Webhook Not Received
- Verify notify URL is accessible from internet
- Check firewall/security settings
- Use ngrok for local testing: `ngrok http 8080`

## Production Checklist

- [ ] Update `OZOW_SITE_CODE` with production site code
- [ ] Update `OZOW_API_KEY` with production API key
- [ ] Update `OZOW_PRIVATE_KEY` with production private key
- [ ] Set `OZOW_IS_TEST=false`
- [ ] Verify all URLs use HTTPS
- [ ] Test payment flow end-to-end
- [ ] Verify webhook notifications are received
- [ ] Test hash verification
- [ ] Monitor payment logs

## Support
- Ozow Documentation: https://hub.ozow.com/docs
- Ozow Support: support@ozow.com
- EduThrift Support: support@eduthrift.co.za

## Files Modified
- `backEnd/services/ozow.js` - Payment URL generation and hash verification
- `backEnd/routes/payments.js` - Payment endpoints
- `frontEnd/eduthrift/index.html` - Ozow modal script
- `frontEnd/eduthrift/src/pages/CheckoutPage.tsx` - Payment initiation
- `frontEnd/eduthrift/src/pages/PaymentSuccess.tsx` - Success page
- `frontEnd/eduthrift/src/pages/PaymentCancel.tsx` - Cancel page
- `frontEnd/eduthrift/src/pages/PaymentError.tsx` - Error page
- `frontEnd/eduthrift/src/App.tsx` - Payment routes
