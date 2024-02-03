import { Module } from "@nestjs/common";
import { TrabajadorService } from "./trabajadores.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    SolicitudVacacionesModule,
    TrabajadoresModule,
  ],
  providers: [TrabajadorService, TrabajadorDatabaseService],
  exports: [TrabajadorService],
})
export class TrabajadoresModule {}
