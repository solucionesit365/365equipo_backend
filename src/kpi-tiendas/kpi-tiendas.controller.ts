import { Controller, UseGuards, Body, Post, Get, Query } from "@nestjs/common";
import { KpiTiendasClass } from "./kpi-tiendas.class";
import { AuthGuard } from "../guards/auth.guard";
import { KpiTiendasInterface } from "./kpi-tiendas.interface";

@Controller("kpi-tiendas")
export class KpiTiendasController {
  constructor(private readonly KpiTiendasClass: KpiTiendasClass) {}

  @UseGuards(AuthGuard)
  @Post("nuevoKpiTienda")
  async nuevoKPI(@Body() kpiTienda: KpiTiendasInterface) {
    try {
      return {
        ok: true,
        data: await this.KpiTiendasClass.nuevoKPI(kpiTienda),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getKPIS")
  async getKPIS(
    @Query()
    { semana, año, tienda }: { semana: number; año: number; tienda: number },
  ) {
    try {
      const respKPIS = await this.KpiTiendasClass.getKPIS(
        Number(semana),
        Number(año),
        Number(tienda),
      );

      if (respKPIS) {
        return { ok: true, data: respKPIS };
      } else {
        throw Error("No se ha encontrado ningun kpis");
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllKPIs")
  async getAllKPI(
    @Query()
    { semana, año }: { semana: number; año: number },
  ) {
    try {
      const respKPIS = await this.KpiTiendasClass.getAllKPIs(
        Number(semana),
        Number(año),
      );

      if (respKPIS.length > 0) {
        return { ok: true, data: respKPIS };
      } else {
        return { ok: false, data: [] };
      }
    } catch (error) {}
  }
}
