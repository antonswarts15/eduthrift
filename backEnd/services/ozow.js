const axios = require('axios');
const crypto = require('crypto');

class OzowService {
  constructor() {
    this.apiKey = process.env.OZOW_API_KEY;
    this.siteCode = process.env.OZOW_SITE_CODE;
    this.privateKey = process.env.OZOW_PRIVATE_KEY;
    this.isTest = process.env.OZOW_IS_TEST === 'true' || process.env.NODE_ENV !== 'production';
    this.baseUrl = this.isTest ? 'https://stagingapi.ozow.com' : 'https://api.ozow.com';
  }

  generateHash(data) {
    const inputString = `${data.SiteCode}${data.CountryCode}${data.CurrencyCode}${data.Amount}${data.TransactionReference}${data.BankReference}${data.CancelUrl}${data.ErrorUrl}${data.SuccessUrl}${data.NotifyUrl}${data.IsTest}${this.privateKey}`;
    return crypto.createHash('sha512').update(inputString.toLowerCase()).digest('hex');
  }

  generatePaymentUrl(orderData) {
    // Validate credentials
    if (!this.siteCode || !this.privateKey) {
      throw new Error('Ozow credentials not configured. Please set OZOW_SITE_CODE and OZOW_PRIVATE_KEY in .env');
    }

    const { 
      amount, 
      transactionReference, 
      bankReference,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl
    } = orderData;

    const payload = {
      SiteCode: this.siteCode,
      CountryCode: 'ZA',
      CurrencyCode: 'ZAR',
      Amount: parseFloat(amount).toFixed(2),
      TransactionReference: transactionReference,
      BankReference: bankReference || transactionReference,
      CancelUrl: cancelUrl,
      ErrorUrl: errorUrl,
      SuccessUrl: successUrl,
      NotifyUrl: notifyUrl,
      IsTest: this.isTest.toString()
    };

    const hashCheck = this.generateHash(payload);
    payload.HashCheck = hashCheck;

    console.log('Ozow Payment Request:', { ...payload, HashCheck: hashCheck.substring(0, 20) + '...' });

    const params = new URLSearchParams(payload).toString();
    return `${this.baseUrl}/PostPaymentRequest?${params}`;
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