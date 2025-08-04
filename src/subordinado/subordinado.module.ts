import { Module } from "@nestjs/common";
import { ISubordinadoRepository } from "./repository/ISubordinado.repository";
import { SubordinadoRepository } from "./repository/Subordinado.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { UpdateResponsableDeLaTiendaController } from "./controllers/UpdateResponsableDeLaTienda.controller";
import { UpdateResponsableDeLaTiendaUseCase } from "./use-cases/UpdateResponsableDeLaTienda.use-case";

@Module({
  imports: [PrismaModule],
  controllers: [UpdateResponsableDeLaTiendaController],
  providers: [
    { provide: ISubordinadoRepository, useClass: SubordinadoRepository },
    UpdateResponsableDeLaTiendaUseCase,
  ],
  exports: [ISubordinadoRepository],
})
export class SubordinadoModule {}
