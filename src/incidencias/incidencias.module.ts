import { Module } from "@nestjs/common";
import { Incidencia } from "./incidencias.class";
import { IncidenciasDatabase } from "./incidencias.mongodb";

@Module({
  providers: [Incidencia, IncidenciasDatabase],
  exports: [Incidencia],
})
export class IncidenciasModule {}
