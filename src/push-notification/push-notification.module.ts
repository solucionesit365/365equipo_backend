import { Module } from "@nestjs/common";
import { NotificationDeviceModule } from "../notification-device/notification-device.module";
import { IPushNotificationToUserUseCase } from "./PushNotificationToUser/IPushNotificationToUser.use-case";
import { PushNotificationToUserUseCase } from "./PushNotificationToUser/PushNotificationToUser.use-case";
import { PushNotificationToUserController } from "./PushNotificationToUser/PushNotificationToUser.controller";

@Module({
  imports: [NotificationDeviceModule],
  providers: [
    {
      provide: IPushNotificationToUserUseCase,
      useClass: PushNotificationToUserUseCase,
    },
  ],
  controllers: [PushNotificationToUserController],
})
export class PushNotificationModule {}
