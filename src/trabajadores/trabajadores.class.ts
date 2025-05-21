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
import {
  TIncludeTrabajador,
  TrabajadorDatabaseService,
} from "./trabajadores.database";
import { UserRecord } from "firebase-admin/auth";
import { Prisma, Trabajador } from "@prisma/client";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";

interface TOmneTrabajador {
  noPerceptor: string;
  apellidosYNombre: string;
  nombre: string;
  email: string;
  documento: string;
  viaPublica: string;
  numero: string;
  piso: string;
  poblacion: string;
  noTelfMovilPersonal: string;
  nacionalidad: number;
  codPaisNacionalidad: string;
  noAfiliacion: string;
  cp: string;
  centroTrabajo: string;
  antiguedadEmpresa: string;
  altaContrato: string;
  bajaEmpresa: string;
  cambioAntiguedad: string;
  categoria: string;
  fechaCalculoAntiguedad: string;
  tipoContrato: string;
  systemModifiedAt: string;
  systemCreatedAt: string;
  horassemana: number;
  descripcionCentro: string;
  auxiliaryIndex1: string;
  auxiliaryIndex2: number;
  auxiliaryIndex3: string;
  auxiliaryIndex4: string;
  empresaID: string;
  fechaNacimiento: DateTime | null;
}

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

  async getTrabajadoresModificadosOmne() {
    const trabajadoresRaw = await this.schTrabajadores.getTrabajadoresOmne();
    return this.crearArrayTrabajadores(trabajadoresRaw);
  }

  private crearArrayTrabajadores(trabajadoresRaw: any): any[] {
    return trabajadoresRaw.flatMap((empresa: any) => {
      if (empresa.trabajadores && Array.isArray(empresa.trabajadores)) {
        return empresa.trabajadores.map((trabajador: any) => {
          // Convertir documento a string, pasar a mayúsculas y quitar espacios
          const documentoNormalizado = String(trabajador.documento)
            .toUpperCase()
            .replace(/\s+/g, "");
          return {
            ...trabajador,
            documento: documentoNormalizado,
            empresaID: empresa.empresaID,
          };
        });
      }
      return [];
    });
  }

  getAllTrabajadores(include: TIncludeTrabajador) {
    return this.schTrabajadores.getAllTrabajadores(include);
  }

  createArrayDNI(trabajadores: any[]): string[] {
    const dniSet = new Set();
    trabajadores.forEach((trabajador) => {
      dniSet.add(trabajador.documento);
    });
    return Array.from(dniSet) as string[];
  }

  // Update Many con diferentes valores a modificar
  updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ) {
    return this.schTrabajadores.actualizarTrabajadoresLote(modificaciones);
  }

  // Método para actualizar contratos
  updateManyContratos(
    contratosModificaciones: Array<{
      contratoId: string;
      horasContrato: number;
    }>,
  ) {
    return this.schTrabajadores.updateManyContratos(contratosModificaciones);
  }

  createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ) {
    return this.schTrabajadores.createManyTrabajadores(arrayNuevosTrabajadores);
  }

  deleteManyTrabajadores(dnis: { dni: string }[]) {
    return this.schTrabajadores.deleteManyTrabajadores(dnis);
  }

  // Todo a mayúsculas y quitar espacios en blanco
  private normalizarDNI(dni: string) {
    return String(dni).toUpperCase().replace(/\s+/g, "");
  }

  getCambiosDetectados(
    trabajadoresApp: Prisma.TrabajadorGetPayload<{
      include: { contratos: true };
    }>[],
    trabajadoresOmne: TOmneTrabajador[],
  ) {
    // 1) Construyo un Map de App por DNI
    const appMap = new Map<string, (typeof trabajadoresApp)[0]>();
    for (const appTrab of trabajadoresApp) {
      const dniNorm = this.normalizarDNI(appTrab.dni);
      appMap.set(dniNorm, appTrab);
    }

    // 2) Arrays de resultado
    const arrayCambios: {
      dni: string;
      cambios: Partial<Trabajador>;
      contrato: {
        fechaAlta: Date | null;
        fechaAntiguedad: Date | null;
        horasContrato: number;
        inicioContrato: Date | null;
        fechaBaja: Date | null;
        finalContrato: Date | null;
        id: string;
      };
    }[] = [];
    const arrayCrear: Prisma.TrabajadorCreateInput[] = [];

    // 3) Recorro Omne una sola vez
    for (const omneTrab of trabajadoresOmne) {
      const dniNorm = this.normalizarDNI(omneTrab.documento);
      const appTrab = appMap.get(dniNorm);

      if (appTrab) {
        // Comparo campos y acumulo diferencias
        const cambios: Partial<Trabajador> = {};

        if (omneTrab.apellidosYNombre !== appTrab.nombreApellidos) {
          cambios.nombreApellidos = omneTrab.apellidosYNombre;
        }
        if (omneTrab.email !== appTrab.emails) {
          cambios.emails = omneTrab.email;
        }
        if (omneTrab.noTelfMovilPersonal !== appTrab.telefonos) {
          cambios.telefonos = omneTrab.noTelfMovilPersonal;
        }
        if (omneTrab.viaPublica !== appTrab.direccion) {
          cambios.direccion = omneTrab.viaPublica;
        }
        if (omneTrab.poblacion !== appTrab.ciudad) {
          cambios.ciudad = omneTrab.poblacion;
        }
        if (omneTrab.codPaisNacionalidad !== appTrab.nacionalidad) {
          cambios.nacionalidad = omneTrab.codPaisNacionalidad;
        }
        if (omneTrab.cp !== appTrab.codigoPostal) {
          cambios.codigoPostal = omneTrab.cp;
        }
        if (omneTrab.noAfiliacion !== appTrab.nSeguridadSocial) {
          cambios.nSeguridadSocial = omneTrab.noAfiliacion;
        }
        // Fecha: convierto ambas a Date y comparo getTime()
        if (omneTrab.fechaNacimiento) {
          const appDate = appTrab.fechaNacimiento?.getTime() ?? null;
          const omneDate = omneTrab.fechaNacimiento.toJSDate().getTime();
          if (appDate !== omneDate) {
            cambios.fechaNacimiento = omneTrab.fechaNacimiento.toJSDate();
          }
        }

        const contrato = {
          fechaAlta:
            omneTrab.altaContrato === "0001-01-01"
              ? null
              : DateTime.fromFormat(
                  omneTrab.altaContrato,
                  "yyyy-MM-dd",
                ).toJSDate(),
          fechaAntiguedad:
            omneTrab.antiguedadEmpresa === "0001-01-01"
              ? null
              : DateTime.fromFormat(
                  omneTrab.antiguedadEmpresa,
                  "yyyy-MM-dd",
                ).toJSDate(),
          horasContrato: this.conversorHorasContratoAPorcentaje(
            parseFloat(String(omneTrab.horassemana)) || 0,
          ),
          inicioContrato:
            omneTrab.altaContrato === "0001-01-01"
              ? null
              : DateTime.fromFormat(
                  omneTrab.altaContrato,
                  "yyyy-MM-dd",
                ).toJSDate(),
          fechaBaja:
            omneTrab.bajaEmpresa === "0001-01-01"
              ? null
              : DateTime.fromFormat(
                  omneTrab.bajaEmpresa,
                  "yyyy-MM-dd",
                ).toJSDate(),
          finalContrato:
            omneTrab.bajaEmpresa === "0001-01-01"
              ? null
              : DateTime.fromFormat(
                  omneTrab.bajaEmpresa,
                  "yyyy-MM-dd",
                ).toJSDate(),
          id: omneTrab.empresaID,
        };

        // Si hay algún cambio y hay fecha de alta, lo registro en un solo push
        if (Object.keys(cambios).length > 0 && contrato.fechaAlta !== null) {
          arrayCambios.push({
            dni: dniNorm,
            cambios,
            contrato,
          });
        }
      } else {
        // No existe en App → crear
        const horasContrato = this.conversorHorasContratoAPorcentaje(
          parseFloat(String(omneTrab.horassemana)) || 0,
        );
        const fechaAlta =
          omneTrab.altaContrato === "0001-01-01"
            ? null
            : DateTime.fromFormat(
                omneTrab.altaContrato,
                "yyyy-MM-dd",
              ).toJSDate();
        const fechaAntiguedad =
          omneTrab.antiguedadEmpresa === "0001-01-01"
            ? null
            : DateTime.fromFormat(
                omneTrab.antiguedadEmpresa,
                "yyyy-MM-dd",
              ).toJSDate();
        const fechaBaja =
          omneTrab.bajaEmpresa === "0001-01-01"
            ? null
            : DateTime.fromFormat(
                omneTrab.bajaEmpresa,
                "yyyy-MM-dd",
              ).toJSDate();

        if (horasContrato && fechaAlta && fechaAntiguedad && !fechaBaja) {
          arrayCrear.push({
            dni: dniNorm,
            nombreApellidos: omneTrab.apellidosYNombre,
            emails: omneTrab.email,
            telefonos: omneTrab.noTelfMovilPersonal,
            direccion: omneTrab.viaPublica,
            ciudad: omneTrab.poblacion,
            nacionalidad: omneTrab.codPaisNacionalidad,
            codigoPostal: omneTrab.cp,
            nSeguridadSocial: omneTrab.noAfiliacion,
            fechaNacimiento: omneTrab.fechaNacimiento?.toJSDate() ?? null,
            llevaEquipo: false,
            tipoTrabajador: "Trabajador",
            contratos: {
              create: {
                fechaAlta,
                fechaAntiguedad,
                horasContrato,
                inicioContrato:
                  omneTrab.altaContrato === "0001-01-01"
                    ? null
                    : DateTime.fromFormat(
                        omneTrab.altaContrato,
                        "yyyy-MM-dd",
                      ).toJSDate(),
                fechaBaja:
                  omneTrab.bajaEmpresa === "0001-01-01"
                    ? null
                    : DateTime.fromFormat(
                        omneTrab.bajaEmpresa,
                        "yyyy-MM-dd",
                      ).toJSDate(),
                finalContrato:
                  omneTrab.bajaEmpresa === "0001-01-01"
                    ? null
                    : DateTime.fromFormat(
                        omneTrab.bajaEmpresa,
                        "yyyy-MM-dd",
                      ).toJSDate(),
                id: omneTrab.empresaID,
              },
            },
          });
        }
      }
    }

    // 4) Detectar eliminaciones en una pasada
    const omneDnis = new Set(
      trabajadoresOmne.map((t) => this.normalizarDNI(t.documento)),
    );
    const arrayEliminar = trabajadoresApp
      .map((t) => this.normalizarDNI(t.dni))
      .filter((dni) => !omneDnis.has(dni))
      .map((dni) => ({ dni }));

    return {
      modificar: arrayCambios,
      crear: arrayCrear,
      eliminar: arrayEliminar,
    };
  }

  cambiosDetectados(
    trabajadoresAppInvocados: Prisma.TrabajadorGetPayload<{
      include: { contratos: true };
    }>[],
    trabajadoresOmneModificados: TOmneTrabajador[],
  ) {
    const trabajadoresParaModificar = [];
    const trabajadoresParaCrear = [];
    const trabajadoresParaEliminar = [];
    const contratosParaActualizar = []; // Nueva estructura para cambios en contratos

    // 1) Mapa de empleados en la App, por DNI
    const appPorDNI = trabajadoresAppInvocados.reduce((acc, t) => {
      acc[t.dni] = t;
      return acc;
    }, {});

    // 2) Agrupar datos de Omne por DNI (puede haber varios contratos)
    const omnePorDNI = trabajadoresOmneModificados.reduce((acc, t) => {
      // Normalizar el documento para asegurar consistencia
      const dni = String(t.documento || "")
        .toUpperCase()
        .replace(/\s+/g, "");
      if (!dni) return acc; // Ignorar registros sin DNI

      if (!acc[dni]) acc[dni] = [];
      acc[dni].push(t);
      return acc;
    }, {});

    // 3) Recorrer cada DNI que viene de Omne
    Object.entries(omnePorDNI).forEach(([dni, contratosOmne]) => {
      const app = appPorDNI[dni];

      if (app) {
        // — existe en ambos → ¿datos distintos?
        const cambios = {};
        const primero = contratosOmne[0];
        const propsMap = {
          apellidosYNombre: "nombreApellidos",
          nombre: "displayName",
          email: "emails",
          documento: "dni",
          telefonos: "telefonos",
          viaPublica: "direccion",
          poblacion: "ciudad",
          noAfiliacion: "nSeguridadSocial",
          codPaisNacionalidad: "nacionalidad",
          cp: "codigoPostal",
          empresaID: "empresaId",
          // Eliminar horasContrato del mapeo ya que pertenece al contrato, no al trabajador
        };

        Object.entries(propsMap).forEach(([kOmne, kApp]) => {
          let vOmne = primero[kOmne];
          let vApp = app[kApp];

          // Normalizar valores para comparación segura
          if (vOmne === undefined || vOmne === null) vOmne = "";
          if (vApp === undefined || vApp === null) vApp = "";

          // Normalizar a string para comparaciones consistentes
          vOmne = String(vOmne);

          // Caso especial: combinación de campos para formar dirección
          if (kOmne === "viaPublica") {
            vOmne = `${primero.viaPublica || ""} ${primero.numero || ""}${
              primero.piso ? ", " + primero.piso : ""
            }`.trim();
          }

          // Caso especial: nacionalidad
          if (kOmne === "codPaisNacionalidad") {
            vOmne = String(primero.codPaisNacionalidad || "");
            vApp = String(app.nacionalidad || "");
          }

          // Comparación general para otros campos
          if (String(vOmne) !== String(vApp)) {
            cambios[kApp] = vOmne;
          }
        });

        // Caso especial: horas contrato - Manejo separado para actualizaciones de contrato
        if (
          primero.horassemana !== undefined &&
          app.contratos &&
          app.contratos.length > 0
        ) {
          const horasContratoPorcentaje =
            this.conversorHorasContratoAPorcentaje(
              parseFloat(String(primero.horassemana)) || 0,
            );

          const appHorasContrato = app.contratos[0].horasContrato || 0;
          const contratoId = app.contratos[0].id;

          // Si hay diferencia en las horas, registrar para actualización separada
          if (Math.abs(horasContratoPorcentaje - appHorasContrato) > 0.01) {
            contratosParaActualizar.push({
              contratoId,
              horasContrato: horasContratoPorcentaje,
              trabajadorId: app.id,
            });
          }
        }

        if (Object.keys(cambios).length) {
          trabajadoresParaModificar.push({ dni, cambios });
        }
      } else {
        // — existe en Omne pero no en la App → crear

        trabajadoresParaCrear.push({ dni, datos: contratosOmne });
      }
    });

    // 4) Detectar eliminaciones: cualquier empleado en la App
    //    cuyo DNI NO aparezca en Omne
    const todosDNIomne = new Set(
      trabajadoresOmneModificados
        .filter((t) => t.documento) // Filtrar registros sin documento
        .map((t) => String(t.documento).toUpperCase().replace(/\s+/g, "")),
    );

    Object.keys(appPorDNI).forEach((dniApp) => {
      if (!todosDNIomne.has(dniApp)) {
        trabajadoresParaEliminar.push({ dni: dniApp });
      }
    });

    return {
      modificar: trabajadoresParaModificar,
      crear: trabajadoresParaCrear,
      eliminar: trabajadoresParaEliminar,
      actualizarContratos: contratosParaActualizar, // Nueva propiedad
    };
  }

  private conversorHorasContratoAPorcentaje(horasContrato: number) {
    if (horasContrato > 0) {
      return Math.round((horasContrato / 40) * 100 * 100) / 100;
    } else {
      return 0;
    }
  }

  async guardarTrabajadoresOmne() {
    return await this.schTrabajadores.guardarTrabajadoresOmne();
  }

  async limpiarTrabajadoresConFinalContrato() {
    return await this.schTrabajadores.borrarConFechaBaja();
  }

  async eliminarTrabajador(idSql: number) {
    try {
      return await this.schTrabajadores.deleteTrabajador(idSql);
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException();
    }
  }

  async getTrabajadorByAppId(uid: string) {
    const resUser = await this.schTrabajadores.getTrabajadorByAppId(uid);
    if (resUser) return resUser;
    throw new InternalServerErrorException(
      "No se ha podido obtener la información del usuario",
    );
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

    throw new InternalServerErrorException(
      "No se ha podido obtener la información del usuario. id: " + id,
    );
  }

  /* Usuarios que no vienen de HIT */
  async crearUsuarioInterno(trabajador: Prisma.TrabajadorCreateInput) {
    return await this.schTrabajadores.crearTrabajadorInterno(trabajador);
  }

  async getTrabajadores() {
    try {
      const arrayTrabajadores = await this.schTrabajadores.getTrabajadores();

      if (arrayTrabajadores) return arrayTrabajadores;
      return [];
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        "Error al obtener los trabajadores",
      );
    }
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

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const resUser = await this.schTrabajadores.getTrabajadorTokenQR(
      idTrabajador,
      tokenQR,
    );

    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
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

  normalizarDNIs() {
    return this.schTrabajadores.normalizarDNIs();
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

  async enviarEmailAuto(automatizaciones: any, user: UserRecord) {
    //Si tiene okTicket
    console.log(automatizaciones);

    if (automatizaciones.okTicket) {
      const emailBody = this.emailInstance.generarEmailTemplate(
        `${automatizaciones.trabajador.nombreApellidos} - ${automatizaciones.trabajador.emails}`,
        "Por favor, dar de alta en <strong>OkTickets</strong> al trabajador:",
      );
      const response = await this.emailInstance.enviarEmail(
        "mcortez@365obrador.com, mpenafiel@365obrador.com",
        emailBody,
        "Alta en OKTickets",
      );
      if (response.accepted.length > 0) {
        return {
          ok: true,
          data: `Emails enviados a ${response.accepted}`,
        };
      } else if (response.rejected.length > 0) {
        return {
          ok: true,
          data: `No se ha podido enviar: ${response.rejected}`,
        };
      }
    }

    //si tiene Yumminn
    if (automatizaciones.yummi) {
      const emailBody = this.emailInstance.generarEmailTemplate(
        `${automatizaciones.trabajador.nombreApellidos} - ${automatizaciones.trabajador.emails}`,
        "Por favor, dar de alta en  en la plataforma de <strong>Yumminn</strong> al trabajador:",
      );
      const response = await this.emailInstance.enviarEmail(
        "mcortez@365obrador.com, malvia@365obrador.com",
        emailBody,
        "Alta en Yummi",
      );

      if (response.accepted.length > 0) {
        return {
          ok: true,
          data: `Emails enviados a ${response.accepted}`,
        };
      } else if (response.rejected.length > 0) {
        return {
          ok: true,
          data: `No se ha podido enviar: ${response.rejected}`,
        };
      }
    }

    //Si neesita ordenador
    if (automatizaciones.ordenador.necesitaOrdenador) {
      const emailBody = this.emailInstance.generarEmailTemplate(
        `<p>Para el trabajador ${automatizaciones.trabajador.nombreApellidos} - ${automatizaciones.trabajador.emails}</p>
              <ul>
        <li> Pefil: ${automatizaciones.ordenador.perfilUsuario.perfilHardware}</li>
        <li>Tipo de ordenador: ${automatizaciones.ordenador.perfilUsuario.tipoOrdenador}</li>
        <li>Procesador: ${automatizaciones.ordenador.perfilUsuario.procesador}</li>
        <li>RAM: ${automatizaciones.ordenador.perfilUsuario.memoria}</li>
        <li>Monitor oficina: ${automatizaciones.ordenador.perfilUsuario.monitorOficina}</li>
        <li>Disco duro: ${automatizaciones.ordenador.perfilUsuario.HHD}</li>
        <li>Pantalla: ${automatizaciones.ordenador.perfilUsuario.pantalla}</li>
        <li>Teclado: ${automatizaciones.ordenador.perfilUsuario.teclado}</li>
        <li>Sistema operativo: ${automatizaciones.ordenador.perfilUsuario.SO}</li>
        <li>Mouse: ${automatizaciones.ordenador.perfilUsuario.mouse}</li>
        <li>Pantalla táctil: ${automatizaciones.ordenador.perfilUsuario.pantallaTactil}</li>
        <li>Huella táctil: ${automatizaciones.ordenador.perfilUsuario.huellaTactil}</li>
        <li>Consideraciones: ${automatizaciones.ordenador.perfilUsuario.detallesExtras}</li>
      </ul>
      <p>Observaciones:</p>
      <p>${automatizaciones.ordenador.observaciones}</p>
       `,
        ` <p> Solicitado por: ${user.displayName} (${user.email}) </p> Por favor, necesitamos un ordenador con las siguientes caracteristicas: `,
      );

      const response = await this.emailInstance.enviarEmail(
        "mcortez@365obrador.com, japerez@365obrador.com",
        emailBody,
        "Solicitud ordenador",
      );

      if (response.accepted.length > 0) {
        return {
          ok: true,
          data: `Emails enviados a ${response.accepted}`,
        };
      } else if (response.rejected.length > 0) {
        return {
          ok: true,
          data: `No se ha podido enviar: ${response.rejected}`,
        };
      }
    }

    if (
      !automatizaciones.okTicket &&
      !automatizaciones.yummi &&
      !automatizaciones.ordenador.necesitaOrdenado
    ) {
      return {
        ok: false,
        data: "No hay ninguna solicitud para enviar",
      };
    }
  }

  async restaurarTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
    return await this.schTrabajadores.crearTrabajador(reqTrabajador);
  }
  async getTrabajadorByCodigo(codigoEmpleado: string) {
    const trabajadores = await this.getTrabajadores(); // Obtener todos los trabajadores

    // Buscar el trabajador con el código de empleado proporcionado
    const trabajadorEncontrado = trabajadores.find(
      (trabajador) => trabajador.id.toString() === codigoEmpleado,
    );

    if (!trabajadorEncontrado) {
      return null; // Si no existe, devolver null
    }

    return trabajadorEncontrado;
  }

  async permitirRegistro(email: string) {
    const trabajador = await this.schTrabajadores.findTrabajadorByEmailLike(
      email.trim().toLowerCase(),
    );
    return trabajador.length > 0;
  }
}
