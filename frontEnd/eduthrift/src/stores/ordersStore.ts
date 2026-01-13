import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment' | 'awaiting_eft';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;
  deliveryAddress?: string;
  pickupPoint?: string;
  trackingNumber?: string;
  shippingProvider?: 'pudo' | 'courierguy';
}

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  updateTrackingInfo: (orderId: string, trackingNumber: string, provider: 'pudo' | 'courierguy') => void;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

  addOrder: (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderDate: new Date().toISOString()
    };

    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return orderId;
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    }));
  },

  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId ? { ...order, paymentStatus } : order
      )
    }));
  },

  updateTrackingInfo: (orderId: string, trackingNumber: string, provider: 'pudo' | 'courierguy') => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId
          ? { ...order, trackingNumber, shippingProvider: provider, status: 'shipped' as const }
          : order
      )
    }));
  },

  getOrderById: (orderId: string) => {
    return get().orders.find(order => order.id === orderId);
  }
}),
    {
      name: 'eduthrift-orders', // localStorage key
    }
  )
);
