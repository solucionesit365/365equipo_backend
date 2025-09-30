import { Injectable } from "@nestjs/common";
import { KpiTiendasDatabase } from "./kpi-tiendas.mondodb";
import { KpiTiendasInterface } from "./kpi-tiendas.interface";

@Injectable()
export class KpiTiendasClass {
  private readonly repo: any;

  constructor(private readonly kpiTiendasDB: KpiTiendasDatabase) {
    this.repo = null;
  }

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

  async borrarKPITienda(kpiTienda: KpiTiendasInterface) {
    return await this.kpiTiendasDB.borrarKPITienda(kpiTienda);
  }
  async borrarKPIsPorSemana(semana: number, año: number) {
    try {
      const result = await this.kpiTiendasDB.borrarKPIsPorSemana(semana, año);

      return result;
    } catch (error) {
      console.error("Error al borrar KPIs por semana:", error);
      throw error;
    }
  }
}
