import { Module } from "@nestjs/common";
import { PerfilHardwareController } from "./perfil-hardware.controller";
import { PerfilHardwareDatabase } from "./perfil-hardware.mongodb";
import { PerfilHardwareService } from "./perfil-hardware.service";

@Module({
  controllers: [PerfilHardwareController],
  exports: [PerfilHardwareService],
  providers: [PerfilHardwareService, PerfilHardwareDatabase],
})
export class PerfilHardwareModule {}
