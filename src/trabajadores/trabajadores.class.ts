import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as schTrabajadores from "./trabajadores.mssql";
import * as moment from "moment";
import { EmailClass } from "../email/email.class";
import { AuthService, auth } from "../firebase/auth";
import { TrabajadorCompleto } from "./trabajadores.interface";
import { PermisosClass } from "../permisos/permisos.class";
import { DateTime } from "luxon";
import { solicitudesVacacionesClass } from "../solicitud-vacaciones/solicitud-vacaciones.class";
// import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class Trabajador {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authInstance: AuthService,
    private readonly permisosInstance: PermisosClass,
    @Inject(forwardRef(() => EmailClass))
    private readonly emailInstance: EmailClass,
    @Inject(forwardRef(() => solicitudesVacacionesClass))
    private readonly solicitudesVacaciones: solicitudesVacacionesClass,
  ) // private readonly prisma: PrismaService,
  {}

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

  async esCoordinadoraPorId(id: number) {
    return await schTrabajadores.esCoordinadoraPorId(id);
  }

  async getSubordinadosByIdsql(id: number) {
    return await schTrabajadores.getSubordinadosByIdsql(id);
  }

  async esCoordinadora(uid: string): Promise<boolean> {
    return await schTrabajadores.esCoordinadora(uid);
  }

  async getSubordinados(uid: string) {
    return await schTrabajadores.getSubordinados(uid);
  }

  async getSubordinadosById(id: number, conFecha?: moment.Moment) {
    return await schTrabajadores.getSubordinadosById(id, conFecha);
  }

  async getSubordinadosByIdNew(id: number, conFecha?: DateTime) {
    return await schTrabajadores.getSubordinadosByIdNew(id, conFecha);
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const resUser = await schTrabajadores.getTrabajadorTokenQR(
      idTrabajador,
      tokenQR,
    );

    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
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

    if (payload.idResponsable)
      if (original.idResponsable !== payload.idResponsable) {
        const nuevoResponsable = await this.getTrabajadorBySqlId(
          payload.idResponsable,
        );
        const nuevoIdAppResponsable = nuevoResponsable.idApp;

        // Actualiza el idAppResponsable en MongoDB para todas las solicitudes del beneficiario y evita que no pueda actualizar
        const solicitudesExisten =
          await this.solicitudesVacaciones.haySolicitudesParaBeneficiario(
            original.id,
          );

        if (solicitudesExisten) {
          await this.solicitudesVacaciones.actualizarIdAppResponsable(
            original.id,
            nuevoIdAppResponsable,
          );
        }
      }

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

  async getHistoricosContratos(dni: string) {
    const resUser = await schTrabajadores.getHistoricoContratos(dni);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getHorasContratoById(idSql: number, fecha: moment.Moment) {
    return await schTrabajadores.getHorasContrato(idSql, fecha);
  }

  /* Cuadrantes 2.0 */
  async getHorasContratoByIdNew(idSql: number, fecha: DateTime) {
    return await schTrabajadores.getHorasContratoNew(idSql, fecha);
  }

  async uploadFoto(displayFoto: string, uid: string) {
    return await schTrabajadores.uploadFoto(displayFoto, uid);
  }

  // async testInsert() {
  //   this.prisma.trabajador.create({
  //     data: {

  //     }
  //   })
  // }

  async deleteHistoricoContratos() {
    await schTrabajadores.deleteHistoricoContratos();
  }

  async insertQuery(query: string) {
    await schTrabajadores.insertQuery(query);
  }

  async actualizarUsuariosApi(usuariosNuevos: any[], modificarEnApp: any[]) {
    await schTrabajadores.actualizarUsuarios(usuariosNuevos, modificarEnApp);
  }

  async eliminarUsuariosApi(arrayEliminar: any[]) {
    await schTrabajadores.eliminarUsuarios(arrayEliminar);
  }
}
