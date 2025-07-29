import { Module, forwardRef } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { ContratoController } from "./contrato.controller";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { IContratoRepository } from "./repository/interfaces/IContrato.repository";
import { ContratoRepository } from "./repository/contrato.repository";
import { ICreateContratoUseCase } from "./use-cases/interfaces/ICreateContrato.use-case";
import { CreateContratoUseCase } from "./use-cases/CreateContrato.use-case";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [forwardRef(() => TrabajadoresModule)],
  providers: [
    ContratoService,
    PrismaService,
    {
      provide: IContratoRepository,
      useClass: ContratoRepository,
    },
    {
      provide: ICreateContratoUseCase,
      useClass: CreateContratoUseCase,
    },
  ],
  controllers: [ContratoController],
  exports: [ContratoService, ICreateContratoUseCase],
})
export class ContratoModule {}
