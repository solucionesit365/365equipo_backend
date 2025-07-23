import { AusenciaCompleta, Prisma } from "@prisma/client";

export abstract class IAusenciaCompletaRepository {
  abstract create(
    nuevaAusencia: Prisma.AusenciaCompletaCreateInput,
  ): Promise<AusenciaCompleta>;

  abstract readOne(idAusencia: string): Promise<AusenciaCompleta>;
  abstract readMany(yearFilter: number): Promise<AusenciaCompleta[]>;
  abstract update(
    idAusencia: string,
    payload: Prisma.AusenciaCompletaUpdateInput,
  ): Promise<AusenciaCompleta>;
  abstract delete(idAusencia: string): Promise<AusenciaCompleta>;
}
