import { Injectable } from "@nestjs/common";
import { IGetAusenciasUseCase } from "../interfaces/IGetAusencias.use-case";
import { IAusenciaCompletaRepository } from "../interfaces/IAusenciaCompleta.repository";
import { IAusenciaParcialRepository } from "../interfaces/IAusenciaParcial.repository";

@Injectable()
export class GetAusenciasUseCase implements IGetAusenciasUseCase {
  constructor(
    private readonly ausenciaParcialRepository: IAusenciaCompletaRepository,
    private readonly ausenciaCompletaRepository: IAusenciaParcialRepository,
  ) {}

  // Juntamos ambos tipos de ausencia
  async execute(year: number) {
    const ausenciasParciales =
      await this.ausenciaParcialRepository.readMany(year);
    const ausenciasCompletas =
      await this.ausenciaCompletaRepository.readMany(year);

    return [...ausenciasCompletas, ...ausenciasParciales];
  }
}
