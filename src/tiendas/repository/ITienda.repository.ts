import { Tienda } from "@prisma/client";

export abstract class ITiendaRepository {
  abstract getTiendas(): Promise<Tienda[]>;
}
