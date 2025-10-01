import { DateTime } from "luxon";

export interface IGetVentasResultAPI {
  "@odata.context": string;
  value: {
    "@odata.etag": string;
    id: string;
    tmst: string;
    lloc: string;
    concepte:
      | "PREVISIO MATI"
      | "PREVISIO TARDA"
      | "VENDES MATI"
      | "VENDES TARDA";
    import: number;
  }[];
}

export interface IGetVentasOneResult {
  id: string;
  tmst: DateTime;
  lloc: string;
  concepte: "PREVISIO MATI" | "PREVISIO TARDA" | "VENDES MATI" | "VENDES TARDA";
  import: number;
}

export abstract class IGetVentasUnaTiendaUseCase {
  abstract execute(
    tienda: string,
    filtroFecha?: { fechaInicio: DateTime; fechaFinal: DateTime },
  ): Promise<IGetVentasOneResult[]>;
}
