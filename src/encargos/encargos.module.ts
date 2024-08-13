import { Module } from "@nestjs/common";
import { EncargosController } from "./encargos.controller";
import { EncargosService } from "./encargos.service";
import { EncargosDatabase } from "./encargos.mongodb";

@Module({
  controllers: [EncargosController],
  exports: [EncargosService],
  providers: [EncargosService, EncargosDatabase],
})
export class EncargosModule {}
