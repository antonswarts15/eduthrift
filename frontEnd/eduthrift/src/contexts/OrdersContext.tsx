import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;
  deliveryAddress?: string;
  pickupPoint?: string;
  trackingNumber?: string;
  shippingProvider?: 'pudo' | 'courierguy';
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  updateTrackingInfo: (orderId: string, trackingNumber: string, provider: 'pudo' | 'courierguy') => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

interface OrdersProviderProps {
  children: ReactNode;
}

export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderDate: new Date().toISOString()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, paymentStatus } : order
    ));
  };

  const updateTrackingInfo = (orderId: string, trackingNumber: string, provider: 'pudo' | 'courierguy') => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, trackingNumber, shippingProvider: provider, status: 'shipped' } : order
    ));
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      updateTrackingInfo,
      getOrderById
    }}>
      {children}
    </OrdersContext.Provider>
  );
};