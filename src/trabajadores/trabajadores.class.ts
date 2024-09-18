import {
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from "@nestjs/common";
import { EmailService } from "../email/email.class";
import { FirebaseService } from "../firebase/firebase.service";
import { PermisosService } from "../permisos/permisos.class";
import { DateTime } from "luxon";
import { SolicitudesVacacionesService } from "../solicitud-vacaciones/solicitud-vacaciones.class";
import { DiaPersonalClass } from "../dia-personal/dia-personal.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";
import { UserRecord } from "firebase-admin/auth";
import { Prisma } from "@prisma/client";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";

@Injectable()
export class TrabajadorService {
  constructor(
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    private readonly permisosInstance: PermisosService,
    private readonly emailInstance: EmailService,
    @Inject(forwardRef(() => SolicitudesVacacionesService))
    private readonly solicitudesVacaciones: SolicitudesVacacionesService,
    @Inject(forwardRef(() => DiaPersonalClass))
    private readonly solicitudesDiaPersonal: DiaPersonalClass,
    private readonly schTrabajadores: TrabajadorDatabaseService,
  ) {}

  async crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
    return await this.schTrabajadores.crearTrabajador(reqTrabajador);
  }

  async eliminarTrabajador(idSql: number) {
    try {
      await this.schTrabajadores.deleteTrabajador(idSql);
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException();
    }
  }

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

  /* Usuarios que no vienen de HIT */
  async crearUsuarioInterno(trabajador: Prisma.TrabajadorCreateInput) {
    return await this.schTrabajadores.crearTrabajadorInterno(trabajador);
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

    if (!DateTime.fromJSDate(datosUsuario.contratos[0]?.inicioContrato).isValid)
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

    return arrayEmails[0].trim();
  }

  async resolverCaptcha(): Promise<boolean> {
    return true;
  }

  async getResponsableTienda(idTienda: number) {
    return await this.schTrabajadores.getResponsableTienda(idTienda);
  }

  async guardarCambiosForm(
    original: TrabajadorFormRequest,
    // usuarioGestor: UserRecord, //corregir para que funcione con los permisos
    payload: TrabajadorFormRequest,
  ) {
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

        const solicitudesExistenDiaPersonal =
          await this.solicitudesDiaPersonal.haySolicitudesParaBeneficiarioDiaPersonal(
            original.id,
          );

        if (solicitudesExisten) {
          await this.solicitudesVacaciones.actualizarIdAppResponsable(
            original.id,
            nuevoIdAppResponsable,
          );
        }
        if (solicitudesExistenDiaPersonal) {
          await this.solicitudesDiaPersonal.actualizarIdAppResponsableDiaPersonal(
            original.id,
            nuevoIdAppResponsable,
          );
        }
      }

    {
      return await this.schTrabajadores.guardarCambiosForm(payload, original);
    }
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
