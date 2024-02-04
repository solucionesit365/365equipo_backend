import { Module } from "@nestjs/common";
import { Nominas } from "./nominas.class";
import { NominasDatabase } from "./nominas.database";
import { NominasController } from "./nominas.controller";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TrabajadoresModule],
  providers: [Nominas, NominasDatabase],
  exports: [Nominas],
  controllers: [NominasController],
})
export class NominasModule {}
