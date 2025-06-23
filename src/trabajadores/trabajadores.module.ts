import { Module, forwardRef } from "@nestjs/common";
import { TrabajadorService } from "./trabajadores.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";
import { TrabajadoresController } from "./trabajadores.controller";
import { DiaPersonalModule } from "../dia-personal/dia-personal.module";
import { MBCTokenModule } from "../bussinesCentral/services/mbctoken/mbctoken.service.module";
import { RoleModule } from "../role/role.module";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    MBCTokenModule,
    RoleModule,
    forwardRef(() => SolicitudVacacionesModule),
    forwardRef(() => DiaPersonalModule),
  ],
  providers: [TrabajadorService, TrabajadorDatabaseService],
  exports: [TrabajadorService],
  controllers: [TrabajadoresController],
})
export class TrabajadoresModule {}
