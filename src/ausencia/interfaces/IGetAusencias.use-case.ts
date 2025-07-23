import { AusenciaCompleta, AusenciaParcial } from "@prisma/client";

export abstract class IGetAusenciasUseCase {
  abstract execute(
    year: number,
  ): Promise<(AusenciaParcial | AusenciaCompleta)[]>;
}
