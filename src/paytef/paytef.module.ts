import { Module } from "@nestjs/common";
import { GetDevicesController } from "./GetDevices/GetDevices.controller";
import { IGetDevicesUseCase } from "./GetDevices/IGetDevices.use-case";
import { GetDevicesUseCase } from "./GetDevices/GetDevices.use-case";
import { NotificacionesModule } from "src/notificaciones/notificaciones.module";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";
import { PushNotificationModule } from "src/push-notification/push-notification.module";

@Module({
  imports: [NotificacionesModule, TrabajadoresModule, PushNotificationModule],
  controllers: [GetDevicesController],
  providers: [{ provide: IGetDevicesUseCase, useClass: GetDevicesUseCase }],
  exports: [IGetDevicesUseCase],
})
export class PaytefModule {}
