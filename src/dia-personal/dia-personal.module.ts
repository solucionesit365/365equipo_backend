import { Module, forwardRef } from "@nestjs/common";
import { DiaPersonalController } from "./dia-personal.controller";
import { DiaPersonalClass } from "./dia-personal.class";
import { diaPersonalMongo } from "./dia-personal.mongodb";
import { EmailModule } from "../email/email.module";
import { ContratoModule } from "../contrato/contrato.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";

@Module({
  imports: [EmailModule, forwardRef(() => TrabajadorModule), ContratoModule],
  providers: [DiaPersonalClass, diaPersonalMongo],
  exports: [DiaPersonalClass],
  controllers: [DiaPersonalController],
})
export class DiaPersonalModule {}
