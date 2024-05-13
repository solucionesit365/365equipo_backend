import { Injectable } from "@nestjs/common";
import { KpiTiendasDatabase } from "./kpi-tiendas.mondodb";
import { KpiTiendasInterface } from "./kpi-tiendas.interface";

@Injectable()
export class KpiTiendasClass {
  constructor(private readonly kpiTiendasDB: KpiTiendasDatabase) {}

  async nuevoKPI(kpiTienda: KpiTiendasInterface) {
    const insertarKPI = await this.kpiTiendasDB.nuevoKPI(kpiTienda);
    if (insertarKPI) return true;

    throw Error("No se ha podido insertar la incidencia");
  }

  async getKPIS(semana: number, año: number, tienda: number) {
    return await this.kpiTiendasDB.getKPIS(semana, año, tienda);
  }

  async getAllKPIs(semana: number, año: number) {
    return await this.kpiTiendasDB.getAllKPIs(semana, año);
  }
}
