import { Module } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import {
  IContratoDatabaseService,
  IContratoService,
} from "./contrato.interface";
import { ContratoDatabaseService } from "./contrato.database";

@Module({
  providers: [
    { provide: IContratoDatabaseService, useClass: ContratoDatabaseService },
    { provide: IContratoService, useClass: ContratoService },
  ],
  exports: [IContratoService],
})
export class ContratoModule {}
