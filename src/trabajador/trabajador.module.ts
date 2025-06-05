import { Module } from "@nestjs/common";
import { TrabajadorRepositoryDatabase } from "./trabajador.database";
import { PermisosModule } from "../permisos/permisos.module";
import { EmailModule } from "../email/email.module";
import { SolicitudVacacionesModule } from "../solicitud-vacaciones/solicitud-vacaciones.module";
import { TrabajadoresController } from "./trabajador.controller";
import { DiaPersonalModule } from "../dia-personal/dia-personal.module";
import { MBCTokenModule } from "../bussinesCentral/services/mbctoken/mbctoken.service.module";
import { ParametrosModule } from "../parametros/parametros.module";
import { TiendaModule } from "../tienda/tienda.module";
import {
  ITrabajadorRepositoryDatabase,
  ITrabajadorRepository,
} from "./trabajador.interface";
import { TrabajadorRepository } from "./trabajador.repository";

@Module({
  imports: [
    PermisosModule,
    EmailModule,
    MBCTokenModule,
    ParametrosModule,
    TiendaModule,
    SolicitudVacacionesModule,
    DiaPersonalModule,
  ],
  providers: [
    { provide: ITrabajadorRepository, useClass: TrabajadorRepository },
    {
      provide: ITrabajadorRepositoryDatabase,
      useClass: TrabajadorRepositoryDatabase,
    },
  ],
  exports: [{ provide: ITrabajadorRepository, useClass: TrabajadorRepository }],
  controllers: [TrabajadoresController],
})
export class TrabajadorModule {}
