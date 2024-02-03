import { Module } from "@nestjs/common";
import { MantenimientoController } from "./mantenimiento.controller";

@Module({
  controllers: [MantenimientoController],
})
export class MantenimientoModule {}
