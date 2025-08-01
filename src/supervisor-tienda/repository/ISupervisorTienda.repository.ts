import { Tienda } from "@prisma/client";

export abstract class ISupervisorTiendaRepository {
  abstract getTiendasDelSupervisor(): Promise<Tienda[]>;
}
