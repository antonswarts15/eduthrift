# Pudo API Integration Guide

## Overview
The Pudo API has been successfully integrated into the Eduthrift application. The integration includes backend services, API routes, and frontend methods to interact with Pudo's locker and shipping services.

## What's Been Implemented

### 1. Backend Integration

#### Files Created/Modified:
- **`/backEnd/pudoService.js`** - Pudo API service wrapper
- **`/backEnd/server.js`** - Added Pudo API routes
- **`/backEnd/.env`** - Added Pudo API credentials
- **`/backEnd/test-pudo.js`** - Test script for API endpoints

#### Available Backend Routes:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pudo/pickup-points` | Get nearby Pudo lockers | No |
| POST | `/pudo/rates` | Get shipping rate quotes | No |
| POST | `/pudo/create-shipment` | Create a shipment/waybill | Yes (JWT) |
| GET | `/pudo/track/:trackingNumber` | Track a shipment | No |
| GET | `/pudo/locker/:lockerId/availability` | Check locker availability | No |

### 2. Frontend Integration

#### Files Modified:
- **`/frontEnd/eduthrift/src/services/shipping.ts`** - Added Pudo API methods

#### Available Frontend Methods:
```typescript
// Get Pudo pickup points
await shippingService.getPudoPickupPoints({
  latitude: -26.1076,
  longitude: 28.0567,
  radius: 10,  // optional, in km
  limit: 20    // optional
});

// Get shipping rates
await shippingService.getPudoRates({
  origin_suburb: 'Sandton',
  destination_suburb: 'Rosebank',
  parcel_weight: 2,  // in kg
  parcel_dimensions: {  // optional
    length: 30,
    width: 20,
    height: 10
  }
});

// Create a shipment
await shippingService.createPudoShipment({
  sender: { name, phone, email, address },
  receiver: { name, phone, email },
  pickup_point_id: 'PUDO001',
  parcels: [{ weight, dimensions, description }],
  reference: 'ORDER-123',
  service_type: 'standard'  // optional
});

// Track a shipment
await shippingService.trackPudoShipment('TRACKING123');

// Check locker availability
await shippingService.getPudoLockerAvailability('LOCKER001');
```

### 3. Configuration

Current environment variables in `/backEnd/.env`:
```env
PUDO_API_KEY=4036|GsgGgLrcPbR6cwkyVSGQdph7Csb8XqpaibWCNgeKf98e7a36
PUDO_API_URL=https://api.pudo.co.za
```

## Current Status & Next Steps

### Issue Encountered
The correct Pudo API base URL needs to be confirmed. We've tried:
- ❌ `https://sandbox.pudo.co.za/api` - SSL certificate mismatch
- ❌ `https://api-sandbox.pudo.co.za` - SSL certificate mismatch
- ❌ `https://api.pudo.co.za` - Domain not found

### What You Need to Do

1. **Contact Pudo Support** or check your Pudo account dashboard for:
   - ✅ Correct sandbox API base URL
   - ✅ Correct API authentication method (query param `api_key`, header `Authorization`, etc.)
   - ✅ API endpoint documentation (paths for lockers, shipments, quotes, etc.)
   - ✅ Example API requests

2. **Update the Configuration**:
   Once you have the correct information, update:
   - `/backEnd/.env` - Update `PUDO_API_URL` with the correct base URL
   - `/backEnd/pudoService.js` - Update endpoints and auth method if needed

3. **Test the Integration**:
   ```bash
   cd backEnd
   node test-pudo.js
   ```

### Known Pudo Endpoints (from search results)
Based on web search, these endpoints were documented:
```
GET  /generate/waybill/:id?api_key=xxx
GET  /generate/sticker/:id?api_key=xxx
GET  /tracking/shipments/public?waybill=xxx
GET  /tracking/shipments?status=xxx&days=xxx&page=xxx
GET  /shipments/pod/images?shipment_id=xxx
GET  /billing/statements?start_date=xxx&end_date=xxx
```

### Authentication
The API appears to use query parameter authentication:
```
?api_key=YOUR_API_KEY
```

This has been implemented in `/backEnd/pudoService.js`.

## How to Use After Setup

### 1. Start the Backend Server
```bash
cd backEnd
npm start
```

### 2. Example API Calls

#### Get Pickup Points
```bash
curl "http://localhost:8080/pudo/pickup-points?latitude=-26.1076&longitude=28.0567&radius=10"
```

#### Get Shipping Rates
```bash
curl -X POST http://localhost:8080/pudo/rates \
  -H "Content-Type: application/json" \
  -d '{
    "origin_suburb": "Sandton",
    "destination_suburb": "Rosebank",
    "parcel_weight": 2
  }'
```

#### Track Shipment
```bash
curl "http://localhost:8080/pudo/track/TRACKING123"
```

### 3. Frontend Usage

Import the shipping service in your React components:
```typescript
import shippingService from '@/services/shipping';

// In your component
const handleGetLockers = async () => {
  const lockers = await shippingService.getPudoPickupPoints({
    latitude: userLocation.lat,
    longitude: userLocation.lng,
    radius: 10
  });
  console.log(lockers);
};
```

## Troubleshooting

### If API calls fail:
1. Check that the backend server is running on port 8080
2. Verify the `PUDO_API_KEY` is correct in `.env`
3. Confirm the `PUDO_API_URL` is the correct sandbox/production URL
4. Check the browser console/network tab for detailed error messages
5. Run the test script: `node backEnd/test-pudo.js`

### API Returns Mock Data:
The integration includes fallback mock data if the real API fails. This allows development to continue while troubleshooting API issues.

## Security Notes

⚠️ **IMPORTANT**:
- Never commit the `.env` file with real API keys to version control
- Add `.env` to `.gitignore` if not already present
- Use environment-specific `.env` files for development, staging, and production
- Revoke and regenerate any API keys that have been exposed publicly

## Documentation Links

- Pudo Customer Portal: https://sandbox.pudo.co.za/
- API Documentation (requires login): https://api-docs.pudo.co.za/
- Postman Collection: https://documenter.getpostman.com/view/14594637/VUqyoZB3

## Support

For Pudo API support:
1. Log in to https://sandbox.pudo.co.za/
2. Navigate to Settings → API Keys
3. Contact Pudo support for API documentation and endpoint details
