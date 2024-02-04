import { Module } from "@nestjs/common";
import { Incidencia } from "./incidencias.class";
import { IncidenciasDatabase } from "./incidencias.mongodb";
import { IncidenciasController } from "./incidencias.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, TrabajadoresModule],
  providers: [Incidencia, IncidenciasDatabase],
  exports: [Incidencia],
  controllers: [IncidenciasController],
})
export class IncidenciasModule {}
