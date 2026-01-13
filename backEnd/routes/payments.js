const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const payGateService = require('../services/paygate');
const ozowService = require('../services/ozow');

// PayFast configuration from environment variables
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Sandbox default
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'; // Sandbox default
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || ''; // Leave empty for sandbox
const PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'; // Use sandbox by default

// Generate PayFast signature
function generatePayFastSignature(data, passPhrase = '') {
  // Create parameter string
  let pfParamString = '';
  for (let key in data) {
    if (data.hasOwnProperty(key) && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
      pfParamString += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  // Add passphrase if provided
  if (passPhrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  // Generate signature
  return crypto.createHash('md5').update(pfParamString).digest('hex');
}

// PayFast payment route
router.post('/payfast', async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerName, description } = req.body;

    // Validate input
    if (!amount || !orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, orderId, customerEmail'
      });
    }

    // PayFast payment data
    const paymentData = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payments/payfast/notify`,

      // Customer details
      name_first: customerName?.split(' ')[0] || 'Customer',
      name_last: customerName?.split(' ').slice(1).join(' ') || 'Name',
      email_address: customerEmail,

      // Transaction details
      m_payment_id: orderId,
      amount: parseFloat(amount).toFixed(2),
      item_name: description || `Order ${orderId}`,
      item_description: description || `Payment for order ${orderId}`,

      // Additional info
      email_confirmation: 1,
      confirmation_address: customerEmail
    };

    // Generate signature
    const signature = generatePayFastSignature(paymentData, PAYFAST_PASSPHRASE);
    paymentData.signature = signature;

    // Build PayFast URL with parameters
    const urlParams = new URLSearchParams(paymentData).toString();
    const paymentUrl = `${PAYFAST_URL}?${urlParams}`;

    res.json({
      success: true,
      paymentUrl,
      paymentId: `PF_${orderId}`,
      message: 'PayFast payment initiated'
    });
  } catch (error) {
    console.error('PayFast payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate PayFast payment',
      error: error.message
    });
  }
});

// PayFast IPN (Instant Payment Notification) handler
router.post('/payfast/notify', async (req, res) => {
  try {
    console.log('PayFast IPN received:', req.body);

    // Verify the payment notification
    const pfData = req.body;

    // Validate signature
    const signature = pfData.signature;
    delete pfData.signature;
    const calculatedSignature = generatePayFastSignature(pfData, PAYFAST_PASSPHRASE);

    if (signature !== calculatedSignature) {
      console.error('PayFast signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    // Check payment status
    const paymentStatus = pfData.payment_status;
    const orderId = pfData.m_payment_id;

    if (paymentStatus === 'COMPLETE') {
      // Update order status in database
      console.log(`Payment successful for order: ${orderId}`);
      // TODO: Update your database with successful payment
    } else {
      console.log(`Payment not complete for order: ${orderId}, status: ${paymentStatus}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast IPN error:', error);
    res.status(500).send('Error processing notification');
  }
});

// PayGate payment route
router.post('/paygate', async (req, res) => {
  try {
    const { amount, orderId, customerEmail } = req.body;

    if (!amount || !orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, orderId, customerEmail'
      });
    }

    const result = await payGateService.initiateTransaction({
      amount,
      email: customerEmail,
      orderId,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/paygate/return`
    });

    res.json({
      success: true,
      ...result,
      message: 'PayGate payment initiated'
    });
  } catch (error) {
    console.error('PayGate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate PayGate payment',
      error: error.message
    });
  }
});

// PayGate return handler (for frontend redirect)
router.post('/paygate/return', async (req, res) => {
  try {
    const data = req.body;
    
    // Verify transaction status
    // Note: PayGate sends status in the return POST
    const transactionStatus = data.TRANSACTION_STATUS;
    const orderId = data.REFERENCE;

    if (transactionStatus === '1') { // 1 = Approved
      console.log(`PayGate payment successful for order: ${orderId}`);
      // TODO: Update database
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
    } else {
      console.log(`PayGate payment failed for order: ${orderId}, status: ${transactionStatus}`);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?orderId=${orderId}`);
    }
  } catch (error) {
    console.error('PayGate return error:', error);
    res.status(500).send('Error processing PayGate return');
  }
});

// Ozow payment route
router.post('/ozow', async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerName } = req.body;

    // Validate input
    if (!amount || !orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const result = await ozowService.createPaymentRequest({
      amount,
      transactionReference: orderId,
      bankReference: `EduThrift-${orderId}`,
      customer: customerName || customerEmail,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?orderId=${orderId}`,
      errorUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?orderId=${orderId}`,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`,
      notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payments/ozow/notify`
    });

    res.json({
      success: true,
      paymentUrl: result.url,
      paymentRequestId: result.paymentRequestId,
      message: 'Ozow payment initiated'
    });
  } catch (error) {
    console.error('Ozow payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Ozow payment',
      error: error.message
    });
  }
});

// Ozow notification handler
router.post('/ozow/notify', async (req, res) => {
  try {
    console.log('Ozow notification received:', req.body);
    
    const data = req.body;
    
    // Verify hash
    if (!ozowService.verifyNotification(data)) {
      console.error('Ozow signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    const status = data.Status;
    const orderId = data.TransactionReference;

    if (status === 'Complete') {
      console.log(`Ozow payment successful for order: ${orderId}`);
      // TODO: Update database
    } else {
      console.log(`Ozow payment not complete for order: ${orderId}, status: ${status}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Ozow notification error:', error);
    res.status(500).send('Error processing notification');
  }
});

// EFT (Electronic Funds Transfer) payment route
router.post('/eft', async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerName } = req.body;

    // Generate bank details for manual EFT
    const bankDetails = {
      accountName: 'EduThrift (Pty) Ltd',
      bank: 'First National Bank',
      accountNumber: '62123456789',
      branchCode: '250655',
      reference: orderId,
      amount: parseFloat(amount).toFixed(2)
    };

    res.json({
      success: true,
      message: 'EFT payment details generated',
      bankDetails
    });
  } catch (error) {
    console.error('EFT payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate EFT details'
    });
  }
});

// Verify payment status
router.get('/verify/:method/:paymentId', async (req, res) => {
  try {
    const { method, paymentId } = req.params;

    // TODO: Implement actual payment verification with payment gateway APIs
    // For now, return mock success
    res.json({
      success: true,
      status: 'completed',
      paymentId,
      method
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

module.exports = router;