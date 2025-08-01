import { Module } from "@nestjs/common";
import { SubordinadoModule } from "src/subordinado/subordinado.module";
import { IGetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/IGetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisor } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.use-case";
import { GetTiendasDelSupervisorController } from "./GetTiendasDelSupervisor/GetTiendasDelSupervisor.controller";

@Module({
  imports: [SubordinadoModule],
  providers: [
    { provide: IGetTiendasDelSupervisor, useClass: GetTiendasDelSupervisor },
  ],
  controllers: [GetTiendasDelSupervisorController],
})
export class SupervisorTiendaModule {}
