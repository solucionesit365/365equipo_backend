import { Module, forwardRef } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { ContratoController } from "./contrato.controller";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [forwardRef(() => TrabajadoresModule)],
  providers: [ContratoService],
  controllers: [ContratoController],
  exports: [ContratoService],
})
export class ContratoModule {}
