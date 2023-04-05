import { Injectable } from "@nestjs/common";
import * as schTiendas from "./tiendas.mssql";
import * as DtoTienda from "./tiendas.dto";

@Injectable()
export class Tienda {
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

  convertirTiendaToExterno(idInterno: number, tiendas: any[]) {
    for (let i = 0; i < tiendas.length; i += 1) {
      if (tiendas[i].id === idInterno) return tiendas[i].idExterno;
    }
    return null;
  }
}

export const tiendaInstance = new Tienda();
