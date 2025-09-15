import { NotificationDevice } from "@prisma/client";

export abstract class IGetUserNotificationDevicesUseCase {
  abstract execute(uid: string): Promise<NotificationDevice[]>;
}
