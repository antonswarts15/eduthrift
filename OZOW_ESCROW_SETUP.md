# Ozow Payment Gateway & Escrow Setup Guide

## Overview

This implementation integrates Ozow (via EBANX) for payments and includes a full escrow system to protect both buyers and sellers.

## What's Implemented

### 1. Payment Gateway (Ozow via EBANX)
- Bank list retrieval
- Payment initiation with bank selection
- Webhook handling for payment status updates
- Redirect flow for customer authentication

### 2. Escrow System
- Automatic fund holding after payment
- Delivery confirmation tracking
- Automatic fund release to seller after delivery
- Refund capability for disputes
- Fee calculation (10% platform + 2.5% payment processing)

### 3. Order Management
- Order creation and tracking
- Status updates throughout lifecycle
- Buyer and seller order views
- Payment and escrow status tracking

## Setup Instructions

### Step 1: Get EBANX Credentials

1. Sign up at https://www.ebanx.com/business/en/
2. Complete merchant verification
3. Get your integration key from the dashboard
4. Note: Start with sandbox for testing

### Step 2: Configure Environment Variables

Add to your `.env` or server environment:

```bash
EBANX_INTEGRATION_KEY=your_integration_key_here
EBANX_API_URL=https://sandbox.ebanx.com  # Use https://api.ebanx.com for production
APP_BASE_URL=https://www.eduthrift.co.za  # Your frontend URL
```

### Step 3: Database Migration

Run this SQL to create the orders table:

```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(255) UNIQUE NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_hash VARCHAR(255),
    escrow_status VARCHAR(50) NOT NULL,
    escrow_amount DECIMAL(10,2),
    platform_fee DECIMAL(10,2),
    payment_processing_fee DECIMAL(10,2),
    seller_payout DECIMAL(10,2),
    payout_status VARCHAR(50),
    payout_date DATETIME,
    tracking_number VARCHAR(255),
    pickup_point VARCHAR(255),
    delivery_confirmed BOOLEAN DEFAULT FALSE,
    delivery_confirmed_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### Step 4: Implement HTTP Client for EBANX

Add to `PaymentController.java`:

```java
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

private final RestTemplate restTemplate = new RestTemplate();

// Replace the TODO in initiateOzowPayment with:
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
HttpEntity<Map<String, Object>> entity = new HttpEntity<>(ebanxRequest, headers);

ResponseEntity<Map> response = restTemplate.postForEntity(
    ebanxApiUrl + "/ws/direct",
    entity,
    Map.class
);

Map<String, Object> responseBody = response.getBody();
String redirectUrl = (String) ((Map) responseBody.get("payment")).get("redirect_url");
String hash = (String) ((Map) responseBody.get("payment")).get("hash");

// Save payment hash to order
Optional<Order> orderOpt = orderRepository.findByOrderNumber(request.orderId);
if (orderOpt.isPresent()) {
    Order order = orderOpt.get();
    order.setPaymentHash(hash);
    orderRepository.save(order);
}

return ResponseEntity.ok(Map.of(
    "success", true,
    "paymentUrl", redirectUrl,
    "hash", hash
));
```

### Step 5: Update Frontend CheckoutPage

Replace the Ozow payment section in `CheckoutPage.tsx`:

```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/ozow/initiate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({
    amount: finalAmount,
    orderId: orderId,
    customerEmail: userProfile.email,
    customerName: `${userProfile.firstName} ${userProfile.lastName}`,
    bankCode: selectedBankCode // Add bank selection to UI
  })
});

const data = await response.json();

if (data.success && data.paymentUrl) {
  window.location.href = data.paymentUrl;
}
```

### Step 6: Set Up Webhooks

1. In EBANX dashboard, configure webhook URL:
   ```
   https://api.eduthrift.co.za/payments/ozow/webhook
   ```

2. The webhook handler will:
   - Receive payment status updates
   - Update order payment status
   - Trigger escrow hold when payment confirmed

### Step 7: Implement Delivery Confirmation

Add button in buyer's order view:

```typescript
const confirmDelivery = async (orderNumber: string) => {
  await fetch(`${API_URL}/orders/${orderNumber}/confirm-delivery`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  // This automatically releases funds to seller
};
```

## Payment Flow

1. **Buyer initiates checkout**
   - Selects items and shipping
   - Chooses bank from list
   - Clicks "Pay with Ozow"

2. **Payment initiation**
   - Backend calls EBANX API
   - Gets redirect URL
   - Buyer redirected to bank

3. **Bank authentication**
   - Buyer logs into their bank
   - Authorizes payment
   - Redirected back to app

4. **Escrow hold**
   - Webhook confirms payment
   - Funds held in escrow
   - Order status: PAYMENT_CONFIRMED

5. **Shipping**
   - Seller ships item
   - Tracking updated
   - Order status: SHIPPED

6. **Delivery & Release**
   - Buyer confirms delivery
   - Escrow releases funds
   - Seller receives payout (87.5%)
   - Order status: COMPLETED

## Fee Structure

- **Buyer pays:** Item price + Shipping
- **Platform takes:** 10% + 2.5% = 12.5%
- **Seller receives:** 87.5% of item price

Example: R100 item
- Buyer pays: R100 + shipping
- Platform fee: R10
- Payment processing: R2.50
- Seller gets: R87.50

## Testing in Sandbox

1. Use sandbox credentials
2. EBANX provides test interface
3. Simulate payment outcomes:
   - Authorized = YES (payment succeeds)
   - Authorized = NO (payment fails)
   - Leave Pending (timeout scenario)

## Production Checklist

- [ ] Get production EBANX credentials
- [ ] Update EBANX_API_URL to production
- [ ] Configure production webhook URL
- [ ] Test full payment flow
- [ ] Test escrow hold and release
- [ ] Test refund scenario
- [ ] Verify seller payouts work
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications

## Security Notes

- Never expose integration key in frontend
- Validate webhook signatures (implement HMAC verification)
- Use HTTPS for all API calls
- Store payment hashes securely
- Log all escrow transactions
- Implement fraud detection

## Support

- EBANX Documentation: https://developers.ebanx.com
- EBANX Support: support@ebanx.com
- Ozow Support: https://ozow.com/support
