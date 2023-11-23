import { Injectable } from "@nestjs/common";
import * as schTiendas from "./tiendas.mssql";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorSql } from "../trabajadores/trabajadores.interface";

@Injectable()
export class Tienda {
  constructor(private readonly trabajadoresInstance: Trabajador) {}

  async getTiendas() {
    const arrayTiendas = await schTiendas.getTiendas();

    if (arrayTiendas) return arrayTiendas;
    throw Error("No hay tiendas");
  }

  async getTiendasHit() {
    return await schTiendas.getTiendasHit();
  }

  async actualizarTiendas() {
    const arrayTiendasApp = await this.getTiendas();
    const arrayTiendasHit = await this.getTiendasHit();

    const tiendasExistentesIds = arrayTiendasApp.map(
      (tiendaApp) => tiendaApp.idExterno,
    );
    const tiendasNuevas = arrayTiendasHit.filter(
      (tiendaExterno) => !tiendasExistentesIds.includes(tiendaExterno.id),
    );
    return schTiendas.addTiendasNuevas(tiendasNuevas);
  }

  private checkExists(arrayTiendas: any[], buscar: any) {
    for (let i = 0; i < arrayTiendas.length; i += 1) {
      if (arrayTiendas[i].idTienda === buscar.idTienda) return true;
    }
    return false;
  }

  async getTiendasResponsable(trabajador: TrabajadorSql) {
    const arrayTrabajadores =
      await this.trabajadoresInstance.getSubordinadosConTienda(
        trabajador.idApp,
      );
    const arrayTiendas = [];

    for (let i = 0; i < arrayTrabajadores.length; i += 1) {
      if (
        !this.checkExists(arrayTiendas, {
          idTienda: arrayTrabajadores[i].idTienda,
          nombreTienda: arrayTrabajadores[i].nombreTienda,
        })
      ) {
        arrayTiendas.push({
          idTienda: arrayTrabajadores[i].idTienda,
          nombreTienda: arrayTrabajadores[i].nombreTienda,
        });
      }
    }

    return arrayTiendas;
  }
}
