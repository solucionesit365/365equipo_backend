import { DateTime } from "luxon";
import { IGetVentasOneResult } from "../GetVentasUnaTienda/IGetVentasUnaTienda.use-case";

export abstract class IGetVentasMultiTiendaUseCase {
  abstract execute(
    tiendas: string[],
    filtroFecha?: { fechaInicio: DateTime; fechaFinal: DateTime },
  ): Promise<IGetVentasOneResult[]>;
}
