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
import { ISincroTrabajadoresUseCase } from "./use-cases/interfaces/ISincroTrabajadores.use-case";
import { SincroTrabajadoresUseCase } from "./use-cases/SincroTrabajadores.use-case";
import { SincroTrabajadoresController } from "./controllers/SincroTrabajadores.controller";
import { ITrabajadorRepository } from "./repository/interfaces/ITrabajador.repository";
import { TrabajadorRepository } from "./repository/Trabajador.repository";
import { EmpresaModule } from "../empresa/empresa.module";
import { ICreateTrabajadorUseCase } from "./use-cases/interfaces/ICreateTrabajador.use-case";
import { CreateTrabajadorUseCase } from "./use-cases/CreateTrabajador.use-case";
import { IUpdateTrabajadorUseCase } from "./use-cases/interfaces/IUpdateTrabajador.use-case";
import { UpdateTrabajadorUseCase } from "./use-cases/UpdateTrabajador.use-case";
import { IDeleteTrabajadorUseCase } from "./use-cases/interfaces/IDeleteTrabajador.use-case";
import { DeleteTrabajadorUseCase } from "./use-cases/DeleteTrabajador.use-case";
import { ContratoModule } from "../contrato/contrato.module";
import { UpdateTrabajadorController } from "./controllers/UpdateTrabajador.controller";
import { IUpdateTrabajadorOrganizacionUseCase } from "./use-cases/interfaces/IUpdateTrabajadorOrganizacion.use-case";
import { UpdateTrabajadorOrganizacionUseCase } from "./use-cases/UpdateTrabajadorOrganizacion.use-case";
import { UpdateTrabajadorOrganizacionController } from "./controllers/UpdateTrabajadorOrganizacion.controller";
import { GetTrabajadoresController } from "./controllers/GetTrabajadores.controller";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    MBCTokenModule,
    RoleModule,
    EmpresaModule,
    forwardRef(() => ContratoModule),
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
    {
      provide: ICreateTrabajadorUseCase,
      useClass: CreateTrabajadorUseCase,
    },
    {
      provide: IUpdateTrabajadorUseCase,
      useClass: UpdateTrabajadorUseCase,
    },
    {
      provide: IDeleteTrabajadorUseCase,
      useClass: DeleteTrabajadorUseCase,
    },
    {
      provide: IUpdateTrabajadorOrganizacionUseCase,
      useClass: UpdateTrabajadorOrganizacionUseCase,
    },
  ],
  exports: [TrabajadorService],
  controllers: [
    TrabajadoresController,
    SincroTrabajadoresController,
    UpdateTrabajadorController,
    UpdateTrabajadorOrganizacionController,
    GetTrabajadoresController,
  ],
})
export class TrabajadoresModule {}
