export interface NotificationFCM {
  title: string;
  message: string;
}

export abstract class IPushNotificationToUserUseCase {
  abstract execute(uid: string, notification: NotificationFCM): Promise<void>;
}
