import { Injectable } from "@nestjs/common";
import { ICreateAusenciaCompletaUseCase } from "../interfaces/ICreateAusenciaCompleta.use-case";
import { Prisma, AusenciaCompleta } from "@prisma/client";
import { IAusenciaCompletaRepository } from "../interfaces/IAusenciaCompleta.repository";

@Injectable()
export class CreateAusenciaCompletaUseCase
  implements ICreateAusenciaCompletaUseCase
{
  constructor(
    private readonly ausenciaRepository: IAusenciaCompletaRepository,
  ) {}

  execute(
    nuevaAusencia: Prisma.AusenciaCompletaCreateInput,
  ): Promise<AusenciaCompleta> {
    return this.ausenciaRepository.create(nuevaAusencia);
  }
}
