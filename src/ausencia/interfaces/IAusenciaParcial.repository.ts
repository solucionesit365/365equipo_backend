import { AusenciaParcial, Prisma } from "@prisma/client";

export abstract class IAusenciaParcialRepository {
  abstract create(
    nuevaAusencia: Prisma.AusenciaParcialCreateInput,
  ): Promise<AusenciaParcial>;

  abstract readOne(idAusencia: string): Promise<AusenciaParcial>;
  abstract readMany(yearFilter: number): Promise<AusenciaParcial[]>;
  abstract update(
    idAusencia: string,
    payload: Prisma.AusenciaParcialUpdateInput,
  ): Promise<AusenciaParcial>;
  abstract delete(idAusencia: string): Promise<AusenciaParcial>;
}
