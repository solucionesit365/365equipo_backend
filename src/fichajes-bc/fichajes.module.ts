import { Module } from "@nestjs/common";
import { Fichajes } from "./fichajes.class";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { FichajesController } from "./fichajes.controller";
import { MBCTokenModule } from "src/bussinesCentral/services/mbctoken/mbctoken.service.module";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TurnoModule } from "src/turno/turno.module";

@Module({
  imports: [
    TrabajadoresModule,
    CuadrantesModule,
    MBCTokenModule,
    NotificacionesModule,
    TurnoModule,
  ],
  providers: [Fichajes, FichajesDatabase],
  exports: [Fichajes],
  controllers: [FichajesController],
})
export class FichajesModule {}
