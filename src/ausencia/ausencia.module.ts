import { Module } from "@nestjs/common";
import { AusenciaParcialRepository } from "./repository/ausenciaParcial.repository";
import { IAusenciaParcialRepository } from "./interfaces/IAusenciaParcial.repository";
import { GetAusenciasController } from "./controllers/GetAusencias.controller";
import { GetAusenciasUseCase } from "./use-cases/GetAusencias.use-case";
import { IGetAusenciasUseCase } from "./interfaces/IGetAusencias.use-case";
import { AusenciaCompletaRepository } from "./repository/AusenciaCompleta.repository";
import { IAusenciaCompletaRepository } from "./interfaces/IAusenciaCompleta.repository";

@Module({
  providers: [
    {
      useClass: AusenciaParcialRepository,
      provide: IAusenciaParcialRepository,
    },
    {
      useClass: AusenciaCompletaRepository,
      provide: IAusenciaCompletaRepository,
    },
    { useClass: GetAusenciasUseCase, provide: IGetAusenciasUseCase },
  ],
  controllers: [GetAusenciasController],
})
export class AusenciaModule {}
