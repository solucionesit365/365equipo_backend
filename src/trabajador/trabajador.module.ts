import { Module, forwardRef } from "@nestjs/common";
import { TrabajadorService } from "./trabajador.service";
import { TrabajadorDatabaseService } from "./trabajador.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";
import { TrabajadoresController } from "./trabajador.controller";
import { DiaPersonalModule } from "../dia-personal/dia-personal.module";
import { MBCTokenModule } from "../bussinesCentral/services/mbctoken/mbctoken.service.module";
import { ParametrosModule } from "../parametros/parametros.module";
import { TiendaModule } from "../tienda/tienda.module";
import { ITrabajadorDatabaseService } from "./trabajador.interface";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    MBCTokenModule,
    ParametrosModule,
    TiendaModule,
    forwardRef(() => SolicitudVacacionesModule),
    forwardRef(() => DiaPersonalModule),
  ],
  providers: [
    TrabajadorService,
    {
      provide: ITrabajadorDatabaseService,
      useClass: TrabajadorDatabaseService,
    },
  ],
  exports: [TrabajadorService],
  controllers: [TrabajadoresController],
})
export class TrabajadorModule {}
