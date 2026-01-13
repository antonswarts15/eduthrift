const axios = require('axios');
const crypto = require('crypto');

class PayGateService {
  constructor() {
    this.payGateId = process.env.PAYGATE_ID || '10011072130';
    this.encryptionKey = process.env.PAYGATE_KEY || 'test';
    this.initiateUrl = process.env.PAYGATE_INITIATE_URL || 'https://secure.paygate.co.za/payweb3/initiate.trans';
  }

  generateChecksum(data) {
    let checksumString = '';
    for (const key in data) {
      if (data[key] !== '') {
        checksumString += data[key];
      }
    }
    checksumString += this.encryptionKey;
    return crypto.createHash('md5').update(checksumString).digest('hex');
  }

  async initiateTransaction(orderData) {
    const { amount, email, orderId, returnUrl } = orderData;

    const params = {
      PAYGATE_ID: this.payGateId,
      REFERENCE: orderId,
      AMOUNT: (amount * 100).toFixed(0), // Amount in cents
      CURRENCY: 'ZAR',
      RETURN_URL: returnUrl,
      TRANSACTION_DATE: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      LOCALE: 'en-za',
      COUNTRY: 'ZAF',
      EMAIL: email
    };

    params.CHECKSUM = this.generateChecksum(params);

    try {
      const response = await axios.post(this.initiateUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const responseData = new URLSearchParams(response.data);
      const requestParams = Object.fromEntries(responseData);

      if (requestParams.ERROR) {
        throw new Error(requestParams.ERROR);
      }

      // Verify checksum of response
      // Note: In a real implementation, you should verify the response checksum here

      return {
        paymentRequestId: requestParams.PAY_REQUEST_ID,
        checksum: requestParams.CHECKSUM,
        redirectUrl: `https://secure.paygate.co.za/payweb3/process.trans` // Or construct full redirect form
      };
    } catch (error) {
      console.error('PayGate initiation error:', error.message);
      throw new Error('Failed to initiate PayGate transaction');
    }
  }

  verifyTransaction(data) {
    // Verify checksum from PayGate notification/return
    const receivedChecksum = data.CHECKSUM;
    delete data.CHECKSUM;
    
    const calculatedChecksum = this.generateChecksum(data);
    
    return receivedChecksum === calculatedChecksum;
  }
}

module.exports = new PayGateService();