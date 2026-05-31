import { create } from 'zustand';
import { notificationsApi } from '../services/api';

export interface Notification {
  id: number;
  title: string;
  body: string;
  relatedOrderNumber?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  /** Add a local ephemeral notification (UI feedback, not persisted to backend). */
  addNotification: (title: string, body: string) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const response = await notificationsApi.getNotifications();
      const notifications: Notification[] = response.data;
      set({
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      });
    } catch {
      // Non-fatal — inbox stays empty if backend unavailable
    }
  },

  addNotification: (title: string, body: string) => set(state => {
    const local: Notification = {
      id: -Date.now(), // negative to distinguish from backend IDs
      title,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    };
    return {
      notifications: [local, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),

  markAsRead: async (id: number) => {
    if (id < 0) {
      // Local notification — mark read in-memory only
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return;
    }
    try {
      await notificationsApi.markAsRead(String(id));
      set(state => {
        const wasUnread = state.notifications.find(n => n.id === id && !n.read);
        return {
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Best-effort
    }
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id: number) => {
    if (id < 0) {
      // Local notification — remove in-memory only
      set(state => {
        const removed = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: removed && !removed.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
      return;
    }
    try {
      await notificationsApi.deleteNotification(String(id));
      set(state => {
        const removed = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: removed && !removed.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch {
      // Ignore
    }
  },
}));
