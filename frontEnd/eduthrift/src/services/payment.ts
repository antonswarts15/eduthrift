const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api');

export interface PaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  message?: string;
  bankDetails?: {
    accountName: string;
    bank: string;
    accountNumber: string;
    branchCode: string;
    reference: string;
  };
}

class PaymentService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Payment API Error: ${response.status}`);
    }

    return response.json();
  }

  // PayFast payment
  async createPayFastPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      return await this.request('/payments/payfast', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      // Mock PayFast response for development
      return {
        success: true,
        paymentUrl: `https://sandbox.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=${paymentData.amount}&item_name=${encodeURIComponent(paymentData.description)}`,
        paymentId: `PF_${Date.now()}`,
        message: 'PayFast payment initiated'
      };
    }
  }

  // Ozow payment
  async createOzowPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      return await this.request('/payments/ozow', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      // Mock Ozow response for development
      return {
        success: true,
        paymentUrl: `https://pay.ozow.com/?amount=${paymentData.amount}&reference=${paymentData.orderId}&description=${encodeURIComponent(paymentData.description)}`,
        paymentId: `OZ_${Date.now()}`,
        message: 'Ozow payment initiated'
      };
    }
  }

  // EFT payment (manual bank transfer)
  async createEFTPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      return await this.request('/payments/eft', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      // Mock EFT response for development
      return {
        success: true,
        message: 'EFT payment details generated',
        bankDetails: {
          accountName: 'EduThrift (Pty) Ltd',
          bank: 'First National Bank',
          accountNumber: '62123456789',
          branchCode: '250655',
          reference: paymentData.orderId
        }
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId: string, method: string): Promise<{ success: boolean; status: string }> {
    try {
      return await this.request(`/payments/verify/${method}/${paymentId}`);
    } catch (error) {
      // Mock verification for development
      return {
        success: true,
        status: 'completed'
      };
    }
  }
}

export default new PaymentService();