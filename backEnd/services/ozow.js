const axios = require('axios');
const crypto = require('crypto');

class OzowService {
  constructor() {
    this.apiKey = process.env.OZOW_API_KEY || 'test-api-key';
    this.siteCode = process.env.OZOW_SITE_CODE || 'TST-MER-001';
    this.privateKey = process.env.OZOW_PRIVATE_KEY || 'test-private-key';
    this.isTest = process.env.NODE_ENV !== 'production';
    this.baseUrl = this.isTest ? 'https://stagingapi.ozow.com' : 'https://api.ozow.com';
  }

  generateHash(data) {
    let hashString = '';
    
    // Order of fields for hash generation as per Ozow documentation
    const fields = [
      'siteCode', 'countryCode', 'currencyCode', 'amount', 
      'transactionReference', 'bankReference', 'optional1', 
      'optional2', 'optional3', 'optional4', 'optional5', 
      'customer', 'cancelUrl', 'errorUrl', 'successUrl', 
      'notifyUrl', 'isTest', 'selectedBankId', 'bankAccountNumber', 
      'branchCode', 'bankAccountName', 'payeeDisplayName', 
      'expiryDateUtc', 'allowVariableAmount', 'variableAmountMin', 
      'variableAmountMax', 'customerIdentifier', 'customerCellphoneNumber'
    ];

    for (const field of fields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        // Convert boolean to lowercase string
        let value = data[field];
        if (typeof value === 'boolean') {
          value = value.toString().toLowerCase();
        }
        hashString += value;
      }
    }

    hashString += this.privateKey;
    return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
  }

  async createPaymentRequest(orderData) {
    const { 
      amount, 
      transactionReference, 
      bankReference, 
      customer,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl
    } = orderData;

    const payload = {
      siteCode: this.siteCode,
      countryCode: 'ZA',
      currencyCode: 'ZAR',
      amount: parseFloat(amount),
      transactionReference,
      bankReference,
      customer,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl,
      isTest: this.isTest
    };

    payload.hashCheck = this.generateHash(payload);

    try {
      // Use URLSearchParams for x-www-form-urlencoded request if JSON fails, 
      // but Ozow API documentation says JSON is supported for /PostPaymentRequest.
      // However, some endpoints might require specific headers.
      
      const response = await axios.post(`${this.baseUrl}/PostPaymentRequest`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Ozow payment request error:', error.response?.data || error.message);
      // Extract meaningful error message
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
  }

  verifyNotification(data) {
    // Verify hash from notification
    const receivedHash = data.Hash;
    
    let hashString = '';
    const fields = [
      'SiteCode', 'TransactionId', 'TransactionReference', 'Amount', 
      'Status', 'Optional1', 'Optional2', 'Optional3', 'Optional4', 
      'Optional5', 'CurrencyCode', 'SubStatus', 'MaskedAccountNumber', 
      'BankName', 'SmartIndicators'
    ];

    for (const field of fields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        let value = data[field];
        if (typeof value === 'boolean') {
          value = value.toString().toLowerCase();
        }
        hashString += value;
      }
    }

    hashString += this.privateKey;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();

    return receivedHash.toLowerCase() === calculatedHash;
  }
}

module.exports = new OzowService();