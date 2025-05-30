import { Module, forwardRef } from "@nestjs/common";
import { SolicitudesVacacionesService } from "./solicitud-vacaciones.service";
import { SolicitudVacacionesDatabaseService } from "./solicitud-vacaciones.database";
import { EmailModule } from "../email/email.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { ContratoModule } from "../contrato/contrato.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { SolicitudVacacionesController } from "./solicitud-vacaciones.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import {
  TSolicitudVacacionesDatabaseService,
  TSolicitudVacacionesService,
} from "./solicitud-vacaciones.interface";

@Module({
  imports: [
    EmailModule,
    forwardRef(() => TrabajadorModule),
    ContratoModule,
    forwardRef(() => CuadrantesModule),
    NotificacionesModule,
  ],
  providers: [
    {
      provide: TSolicitudVacacionesService,
      useClass: SolicitudesVacacionesService,
    },
    {
      provide: TSolicitudVacacionesDatabaseService,
      useClass: SolicitudVacacionesDatabaseService,
    },
  ],
  exports: [TSolicitudVacacionesService],
  controllers: [SolicitudVacacionesController],
})
export class SolicitudVacacionesModule {}
