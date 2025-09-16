import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AxiosBcHitService } from "src/axios/axios-bc.hit.service";
import {
  IGetVentasOneResult,
  IGetVentasResultAPI,
  IGetVentasUnaTiendaUseCase,
} from "./IGetVentasUnaTienda.use-case";
import { DateTime } from "luxon";

@Injectable()
export class GetVentasUnaTiendaUseCase implements IGetVentasUnaTiendaUseCase {
  constructor(private readonly axiosBCService: AxiosBcHitService) {}

  async execute(
    tienda: string,
    filtroFecha?: { fechaInicio: DateTime; fechaFinal: DateTime },
  ): Promise<IGetVentasOneResult[]> {
    try {
      const { data }: { data: IGetVentasResultAPI } = await this.axiosBCService
        .getAxios()
        .get(
          "Production/api/HitSystems/HitSystems/v2.0/companies(2ff42ca6-da42-f011-be59-7c1e523410d3)/powerBI_Data",
        );

      const tiendaLower = tienda.trim().toLocaleLowerCase();

      return data.value
        .map((info) => ({
          ...info,
          tmst: DateTime.fromISO(info.tmst),
          lloc: info.lloc.trim().toLocaleLowerCase(),
        }))
        .filter((info) => {
          const matchTienda = info.lloc.includes(tiendaLower);
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
      console.error("Error fetching ventas:", error);
      throw new InternalServerErrorException();
    }
  }
}
