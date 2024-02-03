import { Module } from "@nestjs/common";
import { SolicitudesVacacionesService } from "./solicitud-vacaciones.class";
import { SolicitudVacacionesDatabase } from "./solicitud-vacaciones.mongodb";
import { EmailModule } from "../email/email.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { ContratoModule } from "../contrato/contrato.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";

@Module({
  imports: [EmailModule, TrabajadoresModule, ContratoModule, CuadrantesModule],
  providers: [SolicitudesVacacionesService, SolicitudVacacionesDatabase],
  exports: [SolicitudesVacacionesService],
})
export class SolicitudVacacionesModule {}
