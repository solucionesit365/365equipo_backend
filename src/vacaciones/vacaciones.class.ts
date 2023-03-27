import * as schVacaciones from "./vacaciones.mssql";

class Vacaciones {
  async getSolicitudesTrabajador(uid: string) {
    return await schVacaciones.getSolicitudesTrabajador(uid);
  }

  async borrarSolicitud(idSolicitud: number) {
    return await schVacaciones.borrarSolicitud(idSolicitud);
  }

  async getSolicitudesSubordinados(idApp: string) {
    return schVacaciones.getSolicitudesSubordinados(idApp);
  }
}

export const vacacionesInstance = new Vacaciones();
