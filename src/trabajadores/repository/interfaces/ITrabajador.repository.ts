import { Prisma, Trabajador } from "@prisma/client";

export abstract class ITrabajadorRepository {
  abstract create(
    newTrabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador>;
  abstract readOne(id: number): Promise<Trabajador>;
  abstract readByDni(dni: string): Promise<Trabajador | null>;
  abstract readByPerceptorAndEmpresa(
    nPerceptor: number,
    empresaId: string,
  ): Promise<Trabajador | null>;
  abstract readAll(filters?: {
    sonPersonas?: boolean;
    sonTiendas?: boolean;
  }): Promise<Trabajador[]>;
  abstract updateOne(
    id: number,
    payload: Prisma.TrabajadorUpdateInput,
  ): Promise<Trabajador>;
  abstract deleteOne(id: number): Promise<boolean>;
}
