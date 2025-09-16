import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AxiosBcHitService } from "src/axios/axios-bc.hit.service";
import { IGetVentasMultiTiendaUseCase } from "./IGetVentasMultiTienda.use-case";
import { DateTime } from "luxon";
import {
  IGetVentasOneResult,
  IGetVentasResultAPI,
} from "../GetVentasUnaTienda/IGetVentasUnaTienda.use-case";

@Injectable()
export class GetVentasMultiTiendaUseCase
  implements IGetVentasMultiTiendaUseCase
{
  constructor(private readonly axiosBCService: AxiosBcHitService) {}

  async execute(
    tiendas: string[],
    filtroFecha?: { fechaInicio: DateTime; fechaFinal: DateTime },
  ): Promise<IGetVentasOneResult[]> {
    try {
      const { data }: { data: IGetVentasResultAPI } = await this.axiosBCService
        .getAxios()
        .get(
          "Production/api/HitSystems/HitSystems/v2.0/companies(2ff42ca6-da42-f011-be59-7c1e523410d3)/powerBI_Data",
        );

      const tiendasLower = tiendas.map((t) => t.trim().toLocaleLowerCase());

      return data.value
        .map((info) => ({
          ...info,
          tmst: DateTime.fromISO(info.tmst),
          lloc: info.lloc.trim().toLocaleLowerCase(),
        }))
        .filter((info) => {
          const matchTienda = tiendasLower.some((t) => info.lloc.includes(t)); // OR
          const matchFecha = filtroFecha
            ? info.tmst >= filtroFecha.fechaInicio &&
              info.tmst <= filtroFecha.fechaFinal
            : true;
          return matchTienda && matchFecha;
        })
        .sort(
          (a, b) => b.tmst.toMillis() - a.tmst.toMillis(),
        ) as IGetVentasOneResult[];
    } catch (error) {
      console.error("Error fetching ventas multi-tienda:", error);
      throw new InternalServerErrorException();
    }
  }
}
