import { trabajadorInstance } from "src/trabajadores/trabajadores.class";
import * as schVacaciones from "./vacaciones.mssql";

class Vacaciones {
  async getSolicitudesTrabajador(uid: string) {
    return await schVacaciones.getSolicitudesTrabajador(uid);
  }

  async borrarSolicitud(idSolicitud: number) {
    return await schVacaciones.borrarSolicitud(idSolicitud);
  }

  async getSolicitudes() {
    return schVacaciones.getSolicitudes();
  }

  async getSolicitudesSubordinados(idApp: string) {
    return schVacaciones.getSolicitudesSubordinados(idApp);
  }

  async setEstadoSolicitud(
    estado: string,
    idSolicitud: number,
    respuesta: string,
  ) {
    const resSeter = await schVacaciones.setEstadoSolicitud(
      estado,
      idSolicitud,
      respuesta,
    );

    if (resSeter) return true;
    else throw Error("No ha sido posible modificar el estado de la solicitud");
  }
}

export const vacacionesInstance = new Vacaciones();
