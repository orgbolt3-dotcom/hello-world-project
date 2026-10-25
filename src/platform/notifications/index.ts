/**
 * Notifications foundation — in-app + (later) push channels.
 */
export type NotificationChannel = "in-app" | "push" | "email";

export interface NotificationPayload {
  id: string;
  channel: NotificationChannel;
  title: string;
  body?: string;
  at: number;
}

export interface NotificationSink {
  notify: (n: NotificationPayload) => void;
}

export const noopNotifications: NotificationSink = {
  notify: () => {},
};
