import { Injectable } from "@nestjs/common";
import { IRegisterNotificationDeviceUseCase } from "./IRegisterNotificationDevice.use-case";
import { INotificationDeviceRepository } from "../repository/INotificationDevice.repository";

@Injectable()
export class RegisterNotificationDeviceUseCase
  implements IRegisterNotificationDeviceUseCase
{
  constructor(
    private readonly notificationDeviceRepository: INotificationDeviceRepository,
  ) {}
  async execute(uid: string, deviceToken: string): Promise<void> {
    await this.notificationDeviceRepository.createOne({
      token: deviceToken,
      trabajador: {
        connect: {
          idApp: uid,
        },
      },
    });
  }
}
