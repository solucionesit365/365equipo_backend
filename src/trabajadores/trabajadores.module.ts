import { Module, forwardRef } from "@nestjs/common";
import { TrabajadorService } from "./trabajadores.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";
import { TrabajadoresController } from "./trabajadores.controller";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    forwardRef(() => SolicitudVacacionesModule),
  ],
  providers: [TrabajadorService, TrabajadorDatabaseService],
  exports: [TrabajadorService],
  controllers: [TrabajadoresController],
})
export class TrabajadoresModule {}
