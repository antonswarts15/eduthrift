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

  setCallbacks(
    notificationFn: (title: string, message: string) => void,
    orderUpdateFn: (orderId: string, status: string) => void
  ) {
    this.notificationCallback = notificationFn;
    this.orderUpdateCallback = orderUpdateFn;
  }

  handleWebhook(data: ShippingWebhookData) {
    if (!data.orderId) return { success: true };

    if (data.status === 'collected' || data.status === 'delivered') {
      this.orderUpdateCallback?.(data.orderId, 'delivered');
      const message =
        data.provider === 'pudo'
          ? `Order ${data.orderId} is ready for collection at your Pudo locker`
          : `Order ${data.orderId} has been delivered successfully`;
      this.notificationCallback?.(
        data.provider === 'pudo' ? 'Ready for Collection' : 'Order Delivered',
        message
      );
    } else if (data.status === 'shipped' || data.status === 'in_transit') {
      this.orderUpdateCallback?.(data.orderId, 'shipped');
    }

    return { success: true };
  }
}

export default new ShippingWebhookService();
