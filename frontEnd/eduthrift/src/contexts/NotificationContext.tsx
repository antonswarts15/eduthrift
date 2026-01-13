import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Order Confirmed', message: 'Your order for school uniform has been confirmed', time: '2 min ago' },
    { id: 2, title: 'New Message', message: 'You have a new message from a buyer', time: '1 hour ago' },
    { id: 3, title: 'Item Sold', message: 'Your textbook has been sold successfully', time: '3 hours ago' },
    { id: 4, title: 'Payment Received', message: 'Payment for your sports equipment has been received', time: '5 hours ago' },
    { id: 5, title: 'New Order', message: 'Someone placed an order for your textbook', time: '1 day ago' }
  ]);

  const addNotification = (title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      time: 'Just now'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};