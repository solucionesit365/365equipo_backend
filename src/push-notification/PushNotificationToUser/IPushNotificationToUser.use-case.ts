export interface NotificationFCM {
  title?: string;
  body?: string;
  link?: string;
  data?: Record<string, string>;
  ttlSeconds?: number;
  iconUrl?: string;
  badgeUrl?: string;
}

export abstract class IPushNotificationToUserUseCase {
  abstract execute(uid: string, notification: NotificationFCM): Promise<void>;
}
