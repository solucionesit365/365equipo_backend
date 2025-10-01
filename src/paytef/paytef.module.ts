import { Module } from "@nestjs/common";
import { GetDevicesController } from "./GetDevices/GetDevices.controller";
import { IGetDevicesUseCase } from "./GetDevices/IGetDevices.use-case";
import { GetDevicesUseCase } from "./GetDevices/GetDevices.use-case";
import { NotificacionesModule } from "src/notificaciones/notificaciones.module";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, TrabajadoresModule],
  controllers: [GetDevicesController],
  providers: [{ provide: IGetDevicesUseCase, useClass: GetDevicesUseCase }],
  exports: [IGetDevicesUseCase],
})
export class PaytefModule {}
