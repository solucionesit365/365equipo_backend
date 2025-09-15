import { Module } from "@nestjs/common";
import { INotificationDeviceRepository } from "./repository/INotificationDevice.repository";
import { NotificationDeviceRepository } from "./repository/NotificationDevice.repository";
import { IRegisterNotificationDeviceUseCase } from "./RegisterNotificationDevice/IRegisterNotificationDevice.use-case";
import { RegisterNotificationDeviceUseCase } from "./RegisterNotificationDevice/RegisterNotificationDevice.use-case";
import { RegisterNotificationDeviceController } from "./RegisterNotificationDevice/RegisterNotificationDevice.controller";
import { GetUserNotificationDevicesController } from "./GetUserNotificationDevices/GetUserNotificationDevices.controller";
import { IGetUserNotificationDevicesUseCase } from "./GetUserNotificationDevices/IGetUserNotificationDevices.use-case";
import { GetUserNotificationDevicesUseCase } from "./GetUserNotificationDevices/GetUserNotificationDevices.use-case";

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
    {
      provide: IGetUserNotificationDevicesUseCase,
      useClass: GetUserNotificationDevicesUseCase,
    },
  ],
  controllers: [
    RegisterNotificationDeviceController,
    GetUserNotificationDevicesController,
  ],
  exports: [INotificationDeviceRepository],
})
export class NotificationDeviceModule {}
