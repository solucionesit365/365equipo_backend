import { Module } from "@nestjs/common";
import { SubordinadoModule } from "src/subordinado/subordinado.module";
import { IGetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/IGetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisorController } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.controller";
import { TiendasModule } from "../tiendas/tiendas.module";

@Module({
  imports: [SubordinadoModule, TiendasModule],
  providers: [
    { provide: IGetTiendasDelSupervisor, useClass: GetTiendasDelSupervisor },
  ],
  controllers: [GetTiendasDelSupervisorController],
})
export class SupervisorTiendaModule {}
