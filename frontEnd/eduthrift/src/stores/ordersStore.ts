import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';
import api from '../services/api';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment' | 'awaiting_eft';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;
  pickupPoint?: string;
  trackingNumber?: string;
  shippingProvider?: 'pudo' | 'courierguy';
  sellerAlias?: string;
  buyerAlias?: string;
  isBuyer?: boolean;
}

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => string;
  fetchOrders: () => Promise<void>;
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
    // Generate a temporary local ID; the real order number comes from the backend
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderDate: new Date().toISOString()
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return orderId;
  },

  fetchOrders: async () => {
    try {
      const response = await api.get('/orders');
      const data = response.data;
      const backendOrders: Order[] = [
        ...(data.buyerOrders || []).map((o: any) => ({ ...o, isBuyer: true })),
        ...(data.sellerOrders || []).map((o: any) => ({ ...o, isBuyer: false }))
      ].map((o: any) => ({
        id: o.orderNumber,
        items: [],
        totalAmount: parseFloat(o.totalAmount),
        status: (o.orderStatus?.toLowerCase() || 'pending_payment') as Order['status'],
        paymentMethod: 'tradesafe',
        paymentStatus: (o.paymentStatus?.toLowerCase() === 'captured' ? 'completed' : o.paymentStatus?.toLowerCase() === 'failed' ? 'failed' : 'pending') as Order['paymentStatus'],
        orderDate: o.createdAt || new Date().toISOString(),
        pickupPoint: o.pickupPoint,
        trackingNumber: o.trackingNumber,
        sellerAlias: o.sellerAlias,
        buyerAlias: o.buyerAlias,
        isBuyer: o.isBuyer
      }));
      set({ orders: backendOrders });
    } catch {
      // Keep existing local orders if fetch fails
    }
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
