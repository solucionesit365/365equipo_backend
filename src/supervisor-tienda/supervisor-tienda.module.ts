import { Module } from "@nestjs/common";
import { SubordinadoModule } from "src/subordinado/subordinado.module";
import { IGetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/IGetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisorController } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.controller";
import { TiendasModule } from "../tiendas/tiendas.module";
import { IUpdateSupervisoraTiendaUseCase } from "./UpdateSupervisoraTienda/IUpdateSupervisoraTienda.use-case";
import { UpdateSupervisoraTiendaUseCase } from "./UpdateSupervisoraTienda/UpdateSupervisoraTienda.use-case";
import { ISupervisorTiendaRepository } from "./repository/ISupervisorTienda.repository";
import { SupervisorTiendaRespository } from "./repository/SupervisorTienda.respository";
import { UpdateSupervisoraTiendaController } from "./UpdateSupervisoraTienda/UpdateSupervisoraTienda.controller";

@Module({
  imports: [SubordinadoModule, TiendasModule],
  providers: [
    { provide: IGetTiendasDelSupervisor, useClass: GetTiendasDelSupervisor },
    {
      provide: IUpdateSupervisoraTiendaUseCase,
      useClass: UpdateSupervisoraTiendaUseCase,
    },
    {
      provide: ISupervisorTiendaRepository,
      useClass: SupervisorTiendaRespository,
    },
  ],
  controllers: [
    GetTiendasDelSupervisorController,
    UpdateSupervisoraTiendaController,
  ],
})
export class SupervisorTiendaModule {}
