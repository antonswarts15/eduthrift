export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo (cents)
  reference: string;
  currency?: string;
  metadata?: any;
  callback?: (response: any) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

class PaystackService {
  private publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

  constructor() {
    if (!this.publicKey) {
      console.error("Paystack public key is not set. Please set VITE_PAYSTACK_PUBLIC_KEY in your .env file.");
    }
  }

  loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  async initializePayment(config: Omit<PaystackConfig, 'publicKey'>): Promise<void> {
    if (!this.publicKey) {
      console.error("Cannot initialize payment: Paystack public key is missing.");
      // Optionally, show a user-facing error here
      return;
    }
    
    await this.loadPaystackScript();
    
    const handler = window.PaystackPop.setup({
      ...config,
      publicKey: this.publicKey,
      currency: config.currency || 'ZAR'
    });

    handler.openIframe();
  }

  generateReference(): string {
    return `EDU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new PaystackService();