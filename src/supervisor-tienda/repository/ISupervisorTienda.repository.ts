import { Tienda } from "@prisma/client";

export abstract class ISupervisorTiendaRepository {
  abstract getTiendasDelSupervisor(): Promise<Tienda[]>;
  abstract updateSupervisoraDeTiendas(
    tiendasIds: number[],
    idSupervisora: number,
  ): Promise<void>;
}
