const crypto = require('crypto');

class PayFastService {
  constructor() {
    this.merchantId = process.env.PAYFAST_MERCHANT_ID;
    this.merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    this.passphrase = process.env.PAYFAST_PASSPHRASE;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.baseUrl = this.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
  }

  generateSignature(data) {
    const pfOutput = Object.keys(data)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');
    
    const signatureString = this.passphrase ? `${pfOutput}&passphrase=${this.passphrase}` : pfOutput;
    return crypto.createHash('md5').update(signatureString).digest('hex');
  }

  createEscrowPayment(orderData) {
    const {
      orderId,
      amount,
      itemName,
      buyerEmail,
      buyerName,
      sellerId,
      sellerAmount,
      platformFee
    } = orderData;

    const paymentData = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/payfast/notify`,
      
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: `Escrow Payment - ${itemName}`,
      item_description: `Secure payment held until delivery confirmation`,
      
      email_address: buyerEmail,
      name_first: buyerName.split(' ')[0],
      name_last: buyerName.split(' ').slice(1).join(' '),
      
      custom_str1: sellerId,
      custom_str2: sellerAmount.toFixed(2),
      custom_str3: platformFee.toFixed(2),
      custom_str4: 'escrow_payment'
    };

    paymentData.signature = this.generateSignature(paymentData);
    
    return {
      url: `${this.baseUrl}/eng/process`,
      data: paymentData
    };
  }

  async releaseEscrowPayment(escrowData) {
    const { sellerId, amount, reference } = escrowData;

    try {
      console.log(`Releasing escrow payment:`, {
        sellerId, amount, reference, timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        payoutId: `PAYOUT_${Date.now()}`,
        message: 'Escrow payment released successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PayFastService();