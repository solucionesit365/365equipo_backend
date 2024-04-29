import { Module, forwardRef } from "@nestjs/common";
import { DiaPersonalController } from "./dia-personal.controller";
import { diaPersonalClass } from "./dia-personal.class";
import { diaPersonalMongo } from "./dia-personal.mongodb";
import { EmailModule } from "../email/email.module";
import { ContratoModule } from "../contrato/contrato.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [
    EmailModule,
    forwardRef(() => TrabajadoresModule),
    forwardRef(() => ContratoModule),
  ],
  controllers: [DiaPersonalController],
  providers: [diaPersonalClass, diaPersonalMongo],
})
export class DiaPersonalModule {}
