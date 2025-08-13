import { Module } from "@nestjs/common";
import { GetDevicesController } from "./GetDevices/GetDevices.controller";
import { IGetDevicesUseCase } from "./GetDevices/IGetDevices.use-case";
import { GetDevicesUseCase } from "./GetDevices/GetDevices.use-case";

@Module({
  controllers: [GetDevicesController],
  providers: [{ provide: IGetDevicesUseCase, useClass: GetDevicesUseCase }],
  exports: [IGetDevicesUseCase],
})
export class PaytefModule {}
