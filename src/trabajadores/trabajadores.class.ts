import * as schTrabajadores from "./trabajadores.mssql";

class Trabajador {
  async getTrabajadorByAppId(uid: string) {
    const resUser = await schTrabajadores.getTrabajadorByAppId(uid);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getTrabajadores() {
    const arrayTrabajadores = await schTrabajadores.getTrabajadores();

    if (arrayTrabajadores) return arrayTrabajadores;
    return [];
  }
}

export const trabajadorInstance = new Trabajador();
