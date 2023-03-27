import * as schTiendas from "./tiendas.mssql";

class Tienda {
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
}

export const tiendaInstance = new Tienda();
