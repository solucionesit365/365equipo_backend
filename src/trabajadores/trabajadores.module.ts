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
import { ISincroTrabajadoresUseCase } from "./SincroTrabajadores/ISincroTrabajadores.use-case";
import { SincroTrabajadoresUseCase } from "./SincroTrabajadores/SincroTrabajadores.use-case";
import { SincroTrabajadoresController } from "./SincroTrabajadores/SincroTrabajadores.controller";
import { ITrabajadorRepository } from "./repository/interfaces/ITrabajador.repository";
import { TrabajadorRepository } from "./repository/Trabajador.repository";
import { EmpresaModule } from "src/empresa/empresa.module";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    MBCTokenModule,
    RoleModule,
    EmpresaModule,
    forwardRef(() => SolicitudVacacionesModule),
    forwardRef(() => DiaPersonalModule),
  ],
  providers: [
    TrabajadorService,
    TrabajadorDatabaseService,
    {
      provide: ISincroTrabajadoresUseCase,
      useClass: SincroTrabajadoresUseCase,
    },
    {
      provide: ITrabajadorRepository,
      useClass: TrabajadorRepository,
    },
  ],
  exports: [TrabajadorService],
  controllers: [TrabajadoresController, SincroTrabajadoresController],
})
export class TrabajadoresModule {}
