import { Module } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { ContratoController } from "./contrato.controller";

@Module({
  providers: [ContratoService],
  controllers: [ContratoController],
  exports: [ContratoService],
})
export class ContratoModule {}
