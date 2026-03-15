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
  notifications: [],

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
