import { create } from 'zustand';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (title: string, message: string) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    { id: 1, title: 'Order Confirmed', message: 'Your order for school uniform has been confirmed', time: '2 min ago' },
    { id: 2, title: 'New Message', message: 'You have a new message from a buyer', time: '1 hour ago' },
    { id: 3, title: 'Item Sold', message: 'Your textbook has been sold successfully', time: '3 hours ago' },
    { id: 4, title: 'Payment Received', message: 'Payment for your sports equipment has been received', time: '5 hours ago' },
    { id: 5, title: 'New Order', message: 'Someone placed an order for your textbook', time: '1 day ago' }
  ],

  addNotification: (title: string, message: string) => set((state) => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      time: 'Just now'
    };
    return { notifications: [newNotification, ...state.notifications] };
  }),

  removeNotification: (id: number) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] })
}));
