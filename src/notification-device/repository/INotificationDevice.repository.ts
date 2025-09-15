import { NotificationDevice, Prisma } from "@prisma/client";

export abstract class INotificationDeviceRepository {
  abstract createOne(
    data: Prisma.NotificationDeviceCreateInput,
  ): Promise<NotificationDevice>;
  abstract upsertOne(
    token: string,
    data: Prisma.NotificationDeviceCreateInput,
  ): Promise<NotificationDevice>;
  abstract getManyByTrabajador(uid: string): Promise<NotificationDevice[]>;
  abstract getOneByToken(token: string): Promise<NotificationDevice>;
  abstract getOneById(id: string): Promise<NotificationDevice>;
  abstract deleteOneByToken(token: string): Promise<void>;
  abstract deleteOneById(id: string): Promise<void>;
}
