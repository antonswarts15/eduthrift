import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import api from './api';

/**
 * Request permission, register for push notifications, and send the FCM token
 * to the backend so the server can push messages to this device.
 *
 * Safe to call on every app start after login — duplicate tokens are idempotent
 * on the backend. Does nothing on web (Capacitor push notifications are native-only).
 */
export async function setupPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token: Token) => {
    try {
      await api.put('/auth/fcm-token', { fcmToken: token.value });
    } catch {
      // Non-fatal — token will be retried on next app start
    }
  });

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    // App is in the foreground — the OS won't show a banner automatically on some platforms.
    // The in-app notification store handles display if needed.
    const { title, body } = notification;
    if (title || body) {
      // Dispatch a custom event so any interested component can react
      window.dispatchEvent(new CustomEvent('fcm-notification', { detail: { title, body } }));
    }
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (_action: ActionPerformed) => {
    // User tapped a notification — navigate to orders
    window.location.hash = '/orders';
  });
}
