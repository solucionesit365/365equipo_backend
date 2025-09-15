import { Injectable } from "@nestjs/common";
import { IGetUserNotificationDevicesUseCase } from "./IGetUserNotificationDevices.use-case";
import { INotificationDeviceRepository } from "../repository/INotificationDevice.repository";
import { NotificationDevice } from "@prisma/client";

@Injectable()
export class GetUserNotificationDevicesUseCase
  implements IGetUserNotificationDevicesUseCase
{
  constructor(
    private readonly notificationDeviceRepository: INotificationDeviceRepository,
  ) {}

  execute(uid: string): Promise<NotificationDevice[]> {
    return this.notificationDeviceRepository.getManyByTrabajador(uid);
  }
}
