import { CartItem } from '../stores/cartStore';

export interface EscrowOrder {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded';
  items: CartItem[];
  createdAt: string;
  paymentReference?: string;
  shippingProvider?: 'pudo' | 'courierguy';
  trackingNumber?: string;
}

class EscrowService {
  private escrowOrders: EscrowOrder[] = [];

  createEscrowOrder(data: {
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    items: CartItem[];
    paymentReference?: string;
    shippingProvider?: 'pudo' | 'courierguy';
    trackingNumber?: string;
  }): EscrowOrder {
    const escrowOrder: EscrowOrder = {
      id: `ESC_${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.escrowOrders.push(escrowOrder);
    return escrowOrder;
  }

  fundEscrow(escrowId: string, paymentReference: string): boolean {
    const escrow = this.escrowOrders.find(e => e.id === escrowId);
    if (escrow && escrow.status === 'pending') {
      escrow.status = 'funded';
      escrow.paymentReference = paymentReference;
      return true;
    }
    return false;
  }

  releasePayment(escrowId: string): boolean {
    const escrow = this.escrowOrders.find(e => e.id === escrowId);
    if (escrow && escrow.status === 'funded') {
      escrow.status = 'released';
      // In real implementation, transfer funds to seller
      return true;
    }
    return false;
  }

  getEscrowByOrderId(orderId: string): EscrowOrder | undefined {
    return this.escrowOrders.find(e => e.orderId === orderId);
  }

  handleDeliveryConfirmation(trackingNumber: string, provider: 'pudo' | 'courierguy', status: 'collected' | 'delivered'): boolean {
    const escrow = this.escrowOrders.find(e => e.trackingNumber === trackingNumber);
    if (!escrow || escrow.status !== 'funded') return false;

    // Pudo: Release on collection, CourierGuy: Release on delivery
    const shouldRelease = (provider === 'pudo' && status === 'collected') || 
                         (provider === 'courierguy' && status === 'delivered');
    
    if (shouldRelease) {
      escrow.status = 'released';
      return true;
    }
    return false;
  }
}

export default new EscrowService();