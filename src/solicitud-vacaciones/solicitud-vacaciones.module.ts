import { Module, forwardRef } from "@nestjs/common";
import { SolicitudesVacacionesService } from "./solicitud-vacaciones.class";
import { SolicitudVacacionesDatabase } from "./solicitud-vacaciones.mongodb";
import { EmailModule } from "../email/email.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { ContratoModule } from "../contrato/contrato.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { SolicitudVacacionesController } from "./solicitud-vacaciones.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";

@Module({
  imports: [
    EmailModule,
    forwardRef(() => TrabajadoresModule),
    forwardRef(() => ContratoModule),
    forwardRef(() => CuadrantesModule),
    NotificacionesModule,
  ],
  providers: [SolicitudesVacacionesService, SolicitudVacacionesDatabase],
  exports: [SolicitudesVacacionesService],
  controllers: [SolicitudVacacionesController],
})
export class SolicitudVacacionesModule {}
