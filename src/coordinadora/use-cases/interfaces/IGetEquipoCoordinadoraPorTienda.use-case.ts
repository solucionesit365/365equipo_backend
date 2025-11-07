import { Trabajador } from "@prisma/client";

export abstract class IGetEquipoCoordinadoraPorTienda {
  // abstract execute(idTienda: number): Promise<Trabajador[]>;
  abstract execute(idTienda: number): Promise<{
    subordinados: Trabajador[];
    coordinadoras: Trabajador[];
  }>;
}
