import { Tiendas2 } from "../tiendas.dto";

export abstract class ITiendaAteneaRepository {
  abstract getTiendasAtenea(): Promise<Tiendas2[]>;
}
