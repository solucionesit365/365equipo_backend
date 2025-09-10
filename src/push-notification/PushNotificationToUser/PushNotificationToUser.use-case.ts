import { Injectable } from "@nestjs/common";
import {
  IPushNotificationToUserUseCase,
  NotificationFCM,
} from "./IPushNotificationToUser.use-case";
import { INotificationDeviceRepository } from "../../notification-device/repository/INotificationDevice.repository";
import { FirebaseService } from "../../firebase/firebase.service";

@Injectable()
export class PushNotificationToUserUseCase
  implements IPushNotificationToUserUseCase
{
  constructor(
    private readonly notificationDeviceRepository: INotificationDeviceRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(uid: string, notification: NotificationFCM): Promise<void> {
    // 1. Obtener los dispositivos del usuario
    // 2. Enviar las notificaciones push

    const userDevices =
      await this.notificationDeviceRepository.getManyByTrabajador(uid);

    for (const device of userDevices) {
      await this.sendTo(device.token, notification);
    }
  }

  private async sendTo(token: string, notification: NotificationFCM) {
    await this.firebaseService.sendPushToToken({
      token,
      data: { message: notification.message },
      title: notification.title,
    });
  }
}
