import { Module } from "@nestjs/common";
import { Incidencia } from "./incidencias.class";
import { IncidenciasDatabase } from "./incidencias.mongodb";
import { IncidenciasController } from "./incidencias.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";

@Module({
  imports: [NotificacionesModule, TrabajadorModule],
  providers: [Incidencia, IncidenciasDatabase],
  exports: [Incidencia],
  controllers: [IncidenciasController],
})
export class IncidenciasModule {}
