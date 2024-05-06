import { Module, forwardRef } from "@nestjs/common";
import { TrabajadorService } from "./trabajadores.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";
import { TrabajadoresController } from "./trabajadores.controller";
import { DiaPersonalModule } from "../dia-personal/dia-personal.module";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    forwardRef(() => SolicitudVacacionesModule),
    forwardRef(() => DiaPersonalModule),
  ],
  providers: [TrabajadorService, TrabajadorDatabaseService],
  exports: [TrabajadorService],
  controllers: [TrabajadoresController],
})
export class TrabajadoresModule {}
