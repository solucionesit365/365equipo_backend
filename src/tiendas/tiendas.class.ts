import { Injectable, Inject, forwardRef } from "@nestjs/common";

import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorSql } from "../trabajadores/trabajadores.interface";
import { TiendaDatabaseService } from "./tiendas.database";

@Injectable()
export class Tienda {
  constructor(
    @Inject(forwardRef(() => Trabajador))
    private readonly trabajadoresInstance: Trabajador,
    private readonly schTiendas: TiendaDatabaseService,
  ) {}

  async getTiendas() {
    const arrayTiendas = await this.schTiendas.getTiendas();

    if (arrayTiendas) return arrayTiendas;
    throw Error("No hay tiendas");
  }

  async getTiendasHit() {
    return await this.schTiendas.getTiendasHit();
  }

  async actualizarTiendas() {
    const arrayTiendasApp = await this.getTiendas();
    const arrayTiendasHit = await this.getTiendasHit();

    const tiendasExistentesIds = arrayTiendasApp.map(
      (tiendaApp) => tiendaApp.idExterno,
    );
    const tiendasNuevas = arrayTiendasHit.filter(
      (tiendaExterno) =>
        !tiendasExistentesIds.includes(tiendaExterno.idExterno),
    );
    return this.schTiendas.addTiendasNuevas(tiendasNuevas);
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

  convertirTiendaToExterno(idInterno: number, tiendas: any[]) {
    for (let i = 0; i < tiendas.length; i += 1) {
      if (tiendas[i].id === idInterno) return tiendas[i].idExterno;
    }
    return null;
  }
}
