import { Module } from "@nestjs/common";
import { Fichajes } from "./fichajes.class";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { FichajesController } from "./fichajes.controller";
import { MBCTokenModule } from "src/bussinesCentral/services/mbctoken/mbctoken.service.module";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";

@Module({
  imports: [
    TrabajadorModule,
    CuadrantesModule,
    MBCTokenModule,
    NotificacionesModule,
  ],
  providers: [Fichajes, FichajesDatabase],
  exports: [Fichajes],
  controllers: [FichajesController],
})
export class FichajesModule {}
