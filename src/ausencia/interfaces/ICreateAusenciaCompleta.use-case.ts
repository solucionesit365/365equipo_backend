import { AusenciaCompleta, Prisma } from "@prisma/client";

export abstract class ICreateAusenciaCompletaUseCase {
  abstract execute(
    nuevaAusencia: Prisma.AusenciaCompletaCreateInput,
  ): Promise<AusenciaCompleta>;
}
