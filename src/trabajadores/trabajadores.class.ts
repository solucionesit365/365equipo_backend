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

  async getTrabajadores(todos = false) {
    const arrayTrabajadores = await schTrabajadores.getTrabajadores(todos);

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

  async sincronizarConHit() {
    const usuariosApp = await this.getTrabajadores(true);
    const usuariosHit = await this.descargarTrabajadoresHit();

    const modificarEnApp = [];
    const modificarEnHit = [];
    const usuariosNuevos = [];

    usuariosHit.forEach((usuarioHit) => {
      const usuarioApp = usuariosApp.find(
        (usuario) => usuario.id === usuarioHit.id,
      );

      if (usuarioApp) {
        const camposApp = [
          "nombreApellidos",
          "displayName",
          "direccion",
          "ciudad",
          "fechaNacimiento",
          "nSeguridadSocial",
          "codigoPostal",
          "cuentaCorriente",
        ];
        const camposHit = [
          "dni",
          "inicioContrato",
          "finalContrato",
          "antiguedad",
        ];

        let cambiosApp = false;
        let cambiosHit = false;

        camposApp.forEach((campo) => {
          if (usuarioApp[campo] !== usuarioHit[campo]) {
            cambiosApp = true;
            return;
          }
        });

        camposHit.forEach((campo) => {
          if (usuarioApp[campo] !== usuarioHit[campo]) {
            cambiosHit = true;
            return;
          }
        });

        if (cambiosApp) {
          modificarEnHit.push(usuarioApp);
        }

        if (cambiosHit) {
          modificarEnApp.push(usuarioHit);
        }
      } else {
        usuariosNuevos.push(usuarioHit);
      }
    });

    const totales = await schTrabajadores.actualizarUsuarios(
      "soluciones",
      usuariosNuevos,
      modificarEnApp,
    );

    return {
      totalModificarApp: modificarEnApp.length,
      totalModificarHit: modificarEnHit.length,
      totalNuevos: usuariosNuevos.length,
      usuariosNoActualizadosNuevos: totales.usuariosNoActualizadosNuevos,
      usuariosNoActualizadosApp: totales.usuariosNoActualizadosApp,
    };
  }
}

export const trabajadorInstance = new Trabajador();
