import * as schTiendas from "./tiendas.mssql";

class Tienda {
  async getTiendas() {
    const arrayTiendas = await schTiendas.getTiendas();

    if (arrayTiendas) return arrayTiendas;
    throw Error("No hay tiendas");
  }
}

export const tiendaInstance = new Tienda();
