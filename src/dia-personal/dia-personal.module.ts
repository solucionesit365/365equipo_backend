import { Module, forwardRef } from "@nestjs/common";
import { DiaPersonalController } from "./dia-personal.controller";
import { DiaPersonalService } from "./dia-personal.class";
import { DiaPersonalDatabaseService } from "./dia-personal.mongodb";
import { EmailModule } from "../email/email.module";
import { ContratoModule } from "../contrato/contrato.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import {
  TDiaPersonalDatabaseService,
  TDiaPersonalService,
} from "./dia-personal.interface";

@Module({
  imports: [EmailModule, forwardRef(() => TrabajadorModule), ContratoModule],
  providers: [
    { provide: TDiaPersonalService, useClass: DiaPersonalService },
    {
      provide: TDiaPersonalDatabaseService,
      useClass: DiaPersonalDatabaseService,
    },
  ],
  exports: [TDiaPersonalService],
  controllers: [DiaPersonalController],
})
export class DiaPersonalModule {}
