import EscrowService from './escrow';

export interface ShippingWebhookData {
  trackingNumber: string;
  status: 'shipped' | 'in_transit' | 'collected' | 'delivered' | 'failed';
  provider: 'pudo' | 'courierguy';
  timestamp: string;
  orderId?: string;
}

class ShippingWebhookService {
  private notificationCallback?: (title: string, message: string) => void;
  private orderUpdateCallback?: (orderId: string, status: string) => void;

  setCallbacks(notificationFn: (title: string, message: string) => void, orderUpdateFn: (orderId: string, status: string) => void) {
    this.notificationCallback = notificationFn;
    this.orderUpdateCallback = orderUpdateFn;
  }

  // Simulate webhook handler for Pudo/CourierGuy status updates
  handleWebhook(data: ShippingWebhookData) {
    console.log('Shipping webhook received:', data);
    
    // Handle escrow release based on provider and status
    const released = EscrowService.handleDeliveryConfirmation(
      data.trackingNumber, 
      data.provider, 
      data.status as 'collected' | 'delivered'
    );

    if (released) {
      console.log(`Payment released for tracking: ${data.trackingNumber}`);
      
      // Update order status
      if (data.orderId) {
        this.orderUpdateCallback?.(data.orderId, 'delivered');
        
        // Send notification
        const message = data.provider === 'pudo' 
          ? `Order ${data.orderId} is ready for collection at Pudo locker`
          : `Order ${data.orderId} has been delivered successfully`;
        
        this.notificationCallback?.(
          data.provider === 'pudo' ? 'Ready for Collection' : 'Order Delivered',
          message
        );
      }
    }

    return { success: true, paymentReleased: released };
  }

  private updateOrderStatus(orderId: string, status: string) {
    // This would typically make an API call to update order status
    // For now, we'll simulate the update
    console.log(`Order ${orderId} status updated to: ${status}`);
  }

  // Simulate webhook calls for testing
  simulatePudoCollection(trackingNumber: string, orderId: string) {
    setTimeout(() => {
      this.handleWebhook({
        trackingNumber,
        status: 'collected',
        provider: 'pudo',
        timestamp: new Date().toISOString(),
        orderId
      });
    }, 5000); // Simulate 5 second delay
  }

  simulateCourierGuyDelivery(trackingNumber: string, orderId: string) {
    setTimeout(() => {
      this.handleWebhook({
        trackingNumber,
        status: 'delivered',
        provider: 'courierguy',
        timestamp: new Date().toISOString(),
        orderId
      });
    }, 8000); // Simulate 8 second delay
  }
}

export default new ShippingWebhookService();