import { Tienda } from "@prisma/client";

export abstract class IGetTiendasDelSupervisor {
  abstract execute(idSupervisor: number): Promise<Tienda[]>;
}
