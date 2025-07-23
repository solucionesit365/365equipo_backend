import { Trabajador } from "@prisma/client";

export abstract class IGetEquipoCoordinadoraPorTienda {
  abstract execute(idTienda: number): Promise<Trabajador[]>;
}
