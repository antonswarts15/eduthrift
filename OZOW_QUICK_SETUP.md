# Quick Ozow Setup

## The Problem
You're seeing an EBANX error because Ozow credentials are not configured. The system needs:
- OZOW_SITE_CODE
- OZOW_PRIVATE_KEY
- OZOW_API_KEY (optional for modal)

## Get Ozow Credentials

### Option 1: Sign Up for Ozow Account
1. Go to https://ozow.com
2. Click "Get Started" or "Sign Up"
3. Complete merchant registration
4. Once approved, get your credentials from the dashboard:
   - Site Code
   - Private Key
   - API Key

### Option 2: Use Ozow Sandbox (For Testing)
Contact Ozow support to get sandbox credentials:
- Email: support@ozow.com
- Request: "Sandbox/Test credentials for development"

## Update Your .env File

Once you have credentials, update `backEnd/.env`:

```env
# Ozow Configuration
OZOW_SITE_CODE=TSTSITE-001          # Your actual site code
OZOW_API_KEY=your-actual-api-key    # Your actual API key
OZOW_PRIVATE_KEY=your-actual-private-key  # Your actual private key
OZOW_IS_TEST=true                   # true for sandbox, false for production
```

## Restart Backend
After updating .env:
```bash
cd backEnd
# Stop the server (Ctrl+C)
# Start again
npm start
```

## Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Click "Pay with Ozow"
4. You should see Ozow payment page (not EBANX)

## Alternative: Use PayFast Instead
Your PayFast credentials are already configured and working:
```env
PAYFAST_MERCHANT_ID=10044439
PAYFAST_MERCHANT_KEY=6tpe9qan0pkh7
PAYFAST_PASSPHRASE=Anton.Swarts101
```

You can use PayFast while waiting for Ozow credentials.

## Need Help?
- Ozow Documentation: https://hub.ozow.com/docs
- Ozow Support: support@ozow.com
- Check backend logs for detailed error messages
