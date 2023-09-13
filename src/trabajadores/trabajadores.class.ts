import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as schTrabajadores from "./trabajadores.mssql";
import * as moment from "moment";
import { EmailClass } from "../email/email.class";
import { AuthService, auth } from "../firebase/auth";
import { TrabajadorCompleto } from "./trabajadores.interface";
import { PermisosClass } from "../permisos/permisos.class";

@Injectable()
export class Trabajador {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authInstance: AuthService,
    private readonly permisosInstance: PermisosClass,
    @Inject(forwardRef(() => EmailClass))
    private readonly emailInstance: EmailClass,
  ) {}

  async getTrabajadorByAppId(uid: string) {
    const resUser = await schTrabajadores.getTrabajadorByAppId(uid);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getTrabajadoresByTienda(idTienda: number) {
    const resUser = await schTrabajadores.getTrabajadoresByTienda(idTienda);
    if (resUser) return resUser;
    throw Error(
      `No se ha podido obtener los trabajadores de la tienda ${idTienda} `,
    );
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

  async getSubordinadosConTiendaPorId(idResponsable: number) {
    return await schTrabajadores.getSubordinadosConTiendaPorId(idResponsable);
  }

  async esCoordinadora(uid: string): Promise<boolean> {
    return await schTrabajadores.esCoordinadora(uid);
  }

  async esCoordinadoraPorId(id: number) {
    return await schTrabajadores.esCoordinadoraPorId(id);
  }

  async getSubordinados(uid: string) {
    return await schTrabajadores.getSubordinados(uid);
  }

  async getSubordinadosById(id: number, conFecha?: moment.Moment) {
    return await schTrabajadores.getSubordinadosById(id, conFecha);
  }

  async getSubordinadosByIdsql(id: number) {
    return await schTrabajadores.getSubordinadosByIdsql(id);
  }
  async descargarTrabajadoresHit() {
    return await schTrabajadores.getTrabajadoresSage();
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const resUser = await schTrabajadores.getTrabajadorTokenQR(
      idTrabajador,
      tokenQR,
    );

    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async sincronizarConHit() {
    const usuariosApp = await this.getTrabajadores(true);
    const usuariosHit = await this.descargarTrabajadoresHit();

    const modificarEnApp = [];
    const modificarEnHit = [];
    const usuariosNuevos = [];
    const arrayEliminar = [];

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
          "idEmpresa",
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

    usuariosApp.forEach((usuarioApp) => {
      const usuarioHit = usuariosHit.find(
        (usuario) => usuario.id === usuarioApp.id,
      );

      if (!usuarioHit) {
        arrayEliminar.push(usuarioApp);
      }
    });

    const totales = await schTrabajadores.actualizarUsuarios(
      "soluciones",
      usuariosNuevos,
      modificarEnApp,
    );

    // Excluir usuario de test id: 999999
    await schTrabajadores.eliminarUsuarios(arrayEliminar);

    return {
      totalModificarApp: modificarEnApp.length,
      modificarEnApp,
      // totalModificarHit: modificarEnHit.length,
      // totalNuevos: usuariosNuevos.length,
      // totalEliminar: arrayEliminar.length,
      // usuariosNoActualizadosNuevos: totales.usuariosNoActualizadosNuevos,
      // usuariosNoActualizadosApp: totales.usuariosNoActualizadosApp,
    };
  }

  async registrarUsuario(dni: string, password: string) {
    dni = dni.trim().toUpperCase();
    const datosUsuario = await schTrabajadores.getTrabajadorByDni(dni);

    if (!moment(datosUsuario.inicioContrato, "DD/MM/YYYY").isValid())
      throw Error("Fecha de inicio de contrato incorrecta");

    const arrayEmails = datosUsuario.emails.split(";");

    if (!datosUsuario.telefonos)
      throw Error("Teléfono no registrado en la ficha");

    if (!arrayEmails[0].trim()) throw Error("Email no registrado en la ficha");

    const usuarioCreado = await auth.createUser({
      email: arrayEmails[0].trim(),
      emailVerified: false,
      phoneNumber: "+34" + datosUsuario.telefonos,
      password: password,
      displayName: datosUsuario.displayName,
      disabled: false,
    });

    await schTrabajadores.setIdApp(datosUsuario.id, usuarioCreado.uid);

    const link = await auth.generateEmailVerificationLink(usuarioCreado.email);
    const body = ` Haz click en el siguiente enlace para verificar tu email:<br>
      ${link}
    `;

    await this.emailInstance.enviarEmail(
      usuarioCreado.email,
      body,
      "365 Equipo - Verificar email",
    );

    return true;
  }

  async resolverCaptcha(): Promise<boolean> {
    return true;
  }

  async getResponsableTienda(idTienda: number) {
    return await schTrabajadores.getResponsableTienda(idTienda);
  }

  async guardarCambiosForm(
    original: any,
    usuarioGestor: TrabajadorCompleto,
    payload: any,
  ) {
    const cualquieraDe = ["SUPER_ADMIN", "RRHH_ADMIN"];

    if (
      this.permisosInstance.pasoPermitidoByClaims(
        usuarioGestor.customClaims?.arrayPermisos,
        cualquieraDe,
      )
    ) {
      return await schTrabajadores.guardarCambiosForm(payload, original);
    } else throw Error("No tienes permisos para realizar esta acción");
  }

  async getNivelMenosUno(idSql: number) {
    return await schTrabajadores.getNivelMenosUno(idSql);
  }

  async getNivelCero(idSql: number) {
    return await schTrabajadores.getNivelCero(idSql);
  }

  async getNivelUno(idSql: number) {
    return await schTrabajadores.getNivelUno(idSql);
  }

  async getArbolById(idSql: number) {
    const nivelMenosUno = await this.getNivelMenosUno(idSql);
    const nivelCero = await this.getNivelCero(idSql);
    const nivelUno = await this.getNivelUno(idSql);

    return {
      nivelMenosUno,
      nivelCero,
      nivelUno,
    };
  }

  private async borrarTrabajadorDeGoogle(uid: string) {
    await this.authInstance.auth.deleteUser(uid);
  }

  private async borrarTrabajadorDeSql(idSql: number) {
    await schTrabajadores.borrarTrabajador(idSql);
  }

  public async borrarTrabajador(idSql: number) {
    const usuario = await this.getTrabajadorBySqlId(idSql);

    if (usuario) {
      if (usuario.idApp) await this.borrarTrabajadorDeGoogle(usuario.idApp);
      await this.borrarTrabajadorDeSql(idSql);
    } else throw Error("No se ha podido recoger la información del usuario");
  }

  async getCoordis() {
    return await schTrabajadores.getCoordinadoras();
  }

  async descargarHistoriaContratos() {
    return await schTrabajadores.copiarHistoriaContratosHitSoluciones();
  }

  async getHistoricosContratos(dni: string) {
    const resUser = await schTrabajadores.getHistoricoContratos(dni);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getHorasContratoById(idSql: number, fecha: moment.Moment) {
    return await schTrabajadores.getHorasContrato(idSql, fecha);
  }

  async uploadFoto(displayFoto: string, uid: string) {
    return await schTrabajadores.uploadFoto(displayFoto, uid);
  }
}
