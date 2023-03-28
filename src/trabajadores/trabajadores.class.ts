import * as schTrabajadores from "./trabajadores.mssql";

class Trabajador {
  async getTrabajadorByAppId(uid: string) {
    const resUser = await schTrabajadores.getTrabajadorByAppId(uid);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getTrabajadorBySqlId(id: number) {
    const resUser = await schTrabajadores.getTrabajadorBySqlId(id);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getTrabajadores() {
    const arrayTrabajadores = await schTrabajadores.getTrabajadores();

    if (arrayTrabajadores) return arrayTrabajadores;
    return [];
  }

  async getSubordinadosConTienda(idAppResponsable: string) {
    return await schTrabajadores.getSubordinadosConTienda(idAppResponsable);
  }

  async esCoordinadora(uid: string) {
    return await schTrabajadores.esCoordinadora(uid);
  }

  async getSubordinados(uid: string) {
    return await schTrabajadores.getSubordinados(uid);
  }

  async descargarTrabajadoresHit() {
    return await schTrabajadores.getTrabajadoresSage();
  }
}

export const trabajadorInstance = new Trabajador();
