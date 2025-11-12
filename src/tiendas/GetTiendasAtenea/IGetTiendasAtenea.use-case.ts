import { Tiendas2 } from "../tiendas.dto";

export abstract class IGetTiendasAteneaUseCase {
  abstract execute(): Promise<Tiendas2[]>;
}
