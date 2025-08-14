import { Module } from "@nestjs/common";
import { INotificationDeviceRepository } from "./repository/INotificationDevice.repository";
import { NotificationDeviceRepository } from "./repository/NotificationDevice.repository";
import { IRegisterNotificationDeviceUseCase } from "./RegisterNotificationDevice/IRegisterNotificationDevice.use-case";
import { RegisterNotificationDeviceUseCase } from "./RegisterNotificationDevice/RegisterNotificationDevice.use-case";
import { RegisterNotificationDeviceController } from "./RegisterNotificationDevice/RegisterNotificationDevice.controller";

@Module({
  providers: [
    {
      provide: INotificationDeviceRepository,
      useClass: NotificationDeviceRepository,
    },
    {
      provide: IRegisterNotificationDeviceUseCase,
      useClass: RegisterNotificationDeviceUseCase,
    },
  ],
  controllers: [RegisterNotificationDeviceController],
  exports: [INotificationDeviceRepository],
})
export class NotificationDeviceModule {}
