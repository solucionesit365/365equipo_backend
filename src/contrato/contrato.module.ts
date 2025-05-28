import { Module, forwardRef } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { IContratoDatabaseService } from "./contrato.interface";

@Module({
  imports: [forwardRef(() => TrabajadorModule)],
  providers: [{ provide: IContratoDatabaseService, useClass: ContratoService }],
  exports: [ContratoService],
})
export class ContratoModule {}
