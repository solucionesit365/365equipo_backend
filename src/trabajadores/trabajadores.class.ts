import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { EmailClass } from "../email/email.class";
import { FirebaseService } from "../firebase/firebase.service";
import { PermisosClass } from "../permisos/permisos.class";
import { DateTime } from "luxon";
import { solicitudesVacacionesClass } from "../solicitud-vacaciones/solicitud-vacaciones.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { DecodedIdToken } from "firebase-admin/auth";

@Injectable()
export class TrabajadorService {
  constructor(
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    private readonly permisosInstance: PermisosClass,
    @Inject(forwardRef(() => EmailClass))
    private readonly emailInstance: EmailClass,
    @Inject(forwardRef(() => solicitudesVacacionesClass))
    private readonly solicitudesVacaciones: solicitudesVacacionesClass,
    private readonly schTrabajadores: TrabajadorDatabaseService, // private readonly prisma: PrismaService,
  ) {}

  async getTrabajadorByAppId(uid: string) {
    const resUser = await this.schTrabajadores.getTrabajadorByAppId(uid);
    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async getTrabajadoresByTienda(idTienda: number) {
    const resUser = await this.schTrabajadores.getTrabajadoresByTienda(
      idTienda,
    );
    if (resUser) return resUser;
    throw Error(
      `No se ha podido obtener los trabajadores de la tienda ${idTienda} `,
    );
  }

  async getTrabajadorBySqlId(id: number) {
    const resUser = await this.schTrabajadores.getTrabajadorBySqlId(id);
    if (resUser) return resUser;
    throw Error(
      "No se ha podido obtener la información del usuario. id: " + id,
    );
  }

  async getTrabajadores() {
    const arrayTrabajadores = await this.schTrabajadores.getTrabajadores();

    if (arrayTrabajadores) return arrayTrabajadores;
    return [];
  }

  async getSubordinadosConTienda(idAppResponsable: string) {
    return await this.schTrabajadores.getSubordinadosConTienda(
      idAppResponsable,
    );
  }

  async getSubordinadosConTiendaPorId(idResponsable: number) {
    return await this.schTrabajadores.getSubordinadosConTiendaPorId(
      idResponsable,
    );
  }

  async esCoordinadoraPorId(id: number) {
    return await this.schTrabajadores.esCoordinadoraPorId(id);
  }

  async getSubordinadosByIdsql(id: number) {
    return await this.schTrabajadores.getSubordinadosByIdsql(id);
  }

  async esCoordinadora(uid: string): Promise<boolean> {
    return await this.schTrabajadores.esCoordinadora(uid);
  }

  async getSubordinados(uid: string) {
    return await this.schTrabajadores.getSubordinados(uid);
  }

  async getSubordinadosById(id: number, conFecha?: DateTime) {
    return await this.schTrabajadores.getSubordinadosById(id, conFecha);
  }

  async getSubordinadosByIdNew(id: number, conFecha?: DateTime) {
    return await this.schTrabajadores.getSubordinadosByIdNew(id, conFecha);
  }

  async descargarTrabajadoresHit() {
    return await this.schTrabajadores.getTrabajadoresSage();
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const resUser = await this.schTrabajadores.getTrabajadorTokenQR(
      idTrabajador,
      tokenQR,
    );

    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  async sincronizarConHit() {
    const usuariosApp = await this.getTrabajadores();
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

    const totales = await this.schTrabajadores.actualizarUsuarios(
      usuariosNuevos,
      modificarEnApp,
    );

    // Excluir usuario de test id: 999999
    await this.schTrabajadores.eliminarUsuarios(arrayEliminar);

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
    const datosUsuario = await this.schTrabajadores.getTrabajadorByDni(dni);

    if (!DateTime.fromJSDate(datosUsuario.contratos[0].inicioContrato).isValid)
      throw Error("Fecha de inicio de contrato incorrecta");

    const arrayEmails = datosUsuario.emails.split(";");

    if (!datosUsuario.telefonos)
      throw Error("Teléfono no registrado en la ficha");

    if (!arrayEmails[0].trim()) throw Error("Email no registrado en la ficha");

    const usuarioCreado = await this.firebaseService.auth.createUser({
      email: arrayEmails[0].trim(),
      emailVerified: false,
      phoneNumber: "+34" + datosUsuario.telefonos,
      password: password,
      displayName: datosUsuario.displayName,
      disabled: false,
    });

    await this.schTrabajadores.setIdApp(datosUsuario.id, usuarioCreado.uid);

    const link = await this.firebaseService.auth.generateEmailVerificationLink(
      usuarioCreado.email,
    );
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
    return await this.schTrabajadores.getResponsableTienda(idTienda);
  }

  async guardarCambiosForm(
    original: any,
    usuarioGestor: DecodedIdToken,
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
      return await this.schTrabajadores.guardarCambiosForm(payload, original);
    } else throw Error("No tienes permisos para realizar esta acción");
  }

  async getNivelMenosUno(idSql: number) {
    return await this.schTrabajadores.getNivelMenosUno(idSql);
  }

  async getNivelCero(idSql: number) {
    return await this.schTrabajadores.getNivelCero(idSql);
  }

  async getNivelUno(idSql: number) {
    return await this.schTrabajadores.getNivelUno(idSql);
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
    await this.firebaseService.auth.deleteUser(uid);
  }

  private async borrarTrabajadorDeSql(idSql: number) {
    await this.schTrabajadores.borrarTrabajador(idSql);
  }

  public async borrarTrabajador(idSql: number) {
    const usuario = await this.getTrabajadorBySqlId(idSql);

    if (usuario) {
      if (usuario.idApp) await this.borrarTrabajadorDeGoogle(usuario.idApp);
      await this.borrarTrabajadorDeSql(idSql);
    } else throw Error("No se ha podido recoger la información del usuario");
  }

  async getCoordis() {
    return await this.schTrabajadores.getCoordinadoras();
  }

  async uploadFoto(displayFoto: string, uid: string) {
    return await this.schTrabajadores.uploadFoto(displayFoto, uid);
  }
}
