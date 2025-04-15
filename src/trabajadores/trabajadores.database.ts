import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";
import { ParametrosService } from "../parametros/parametros.service";
import { MbctokenService } from "src/bussinesCentral/services/mbctoken/mbctoken.service";
import { Tienda } from "src/tiendas/tiendas.class";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";
import { axiosBCInstance } from "src/axios/axiosBC";

@Injectable()
export class TrabajadorDatabaseService {
  constructor(
    private prisma: PrismaService,
    private readonly parametrosService: ParametrosService,
    private readonly mbctokenService: MbctokenService,
    private readonly tiendaInstance: Tienda,
  ) {}

  async crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
    console.log(reqTrabajador);

    const newTrabajador = await this.prisma.trabajador.create({
      data: {
        dni: reqTrabajador.dni,
        nombreApellidos: reqTrabajador.nombreApellidos,
        displayName: reqTrabajador.displayName,
        emails: reqTrabajador.emails,
        direccion: reqTrabajador.direccion,
        llevaEquipo: reqTrabajador.llevaEquipo,
        tipoTrabajador: reqTrabajador.tipoTrabajador,
        ciudad: reqTrabajador.ciudad,
        telefonos: reqTrabajador.telefonos,
        codigoPostal: reqTrabajador.codigoPostal,
        cuentaCorriente: reqTrabajador.cuentaCorriente,
        fechaNacimiento: reqTrabajador.fechaNacimiento,
        nacionalidad: reqTrabajador.nacionalidad,
        displayFoto: reqTrabajador.displayFoto,
        excedencia: reqTrabajador.excedencia,
        empresa: {
          connect: {
            id: reqTrabajador.idEmpresa,
          },
        },
        responsable: reqTrabajador.idResponsable
          ? {
              connect: {
                id: reqTrabajador.idResponsable,
              },
            }
          : {},
        nSeguridadSocial: reqTrabajador.nSeguridadSocial,
        tienda: reqTrabajador.idTienda
          ? {
              connect: {
                id: reqTrabajador.idTienda,
              },
            }
          : {},
        roles: {
          connect: reqTrabajador.arrayRoles.map((rol) => ({
            id: rol,
          })),
        },
      },
    });
    // if (!reqTrabajador.idResponsable) {
    //   delete data.responsable;
    // }

    await this.prisma.contrato2.create({
      data: {
        Trabajador: {
          connect: {
            id: newTrabajador.id,
          },
        },
        fechaAlta: reqTrabajador.contrato.fechaAlta,
        fechaAntiguedad: reqTrabajador.contrato.fechaAntiguedad,
        horasContrato: reqTrabajador.contrato.horasContrato,
        inicioContrato: reqTrabajador.contrato.inicioContrato,
        fechaBaja: reqTrabajador.contrato.fechaBaja,
        finalContrato: reqTrabajador.contrato.finalContrato,
      },
    });

    return true;
  }

  // Función que obtiene los trabajadores desde Business Central
  async getTrabajadoresOmne(): Promise<
    Array<
      | {
          empresaID: string;
          nombre: string;
          mensaje?: string;
          trabajadores?: any;
        }
      | { empresaID?: string; nombre?: string; error: string }
    >
  > {
    try {
      // Estas empresas hay que guardarlas desde la base de datos
      const empresas: Array<{ empresaID: string; nombre: string }> = [
        {
          empresaID: "84290dc4-6e90-ef11-8a6b-7c1e5236b0db",
          nombre: "Arrazaos S.L.U",
        },
        {
          empresaID: "86ee4d52-801e-ef11-9f88-0022489dfd5d",
          nombre: "Filapeña S.L.U",
        },
        {
          empresaID: "fb77685d-6f90-ef11-8a6b-7c1e5236b0db",
          nombre: "Horreols S.L.U",
        },
        {
          empresaID: "d2a97ec2-654e-ef11-bfe4-7c1e5234e806",
          nombre: "IME Mil S.L.U",
        },
        {
          empresaID: "e60b9619-6f90-ef11-8a6b-7c1e5236b0db",
          nombre: "Pomposo S.L.U",
        },
        {
          empresaID: "f81d2993-7e1e-ef11-9f88-000d3ab5a7ff",
          nombre: "Silema S.L.U",
        },
      ];

      // Obtener parámetros (incluida la fecha de sincronización)
      const parametros = await this.parametrosService.getParametros(
        "sincro_trabajadores",
      );
      console.log(
        "Última fecha de sincronización: " + parametros[0].lastSyncWorkers,
      );

      if (!parametros[0].lastSyncWorkers) {
        // Retornamos un array con el error para que el caller pueda iterar sin problemas.
        return [
          { error: "No se ha encontrado la última fecha de sincronización." },
        ];
      }

      // Ejecutar las consultas en paralelo para cada empresa
      const resultados = await Promise.all(
        empresas.map(async ({ empresaID, nombre }) => {
          try {
            const response = await axiosBCInstance.get(
              `Production/api/Miguel/365ObradorAPI/v1.0/companies(${empresaID})/perceptoresQuery?$filter=SystemModifiedAt gt ${parametros[0].lastSyncWorkers}`,
            );

            const trabajadores = response.data.value;
            return trabajadores.length === 0
              ? {
                  empresaID,
                  nombre,
                  mensaje: "No hay trabajadores nuevos ni actualizaciones.",
                }
              : { empresaID, nombre, trabajadores };
          } catch (error) {
            return { empresaID, nombre, error: error.message };
          }
        }),
      );

      return resultados;
    } catch (error) {
      return [{ error: error.message }];
    }
  }

  getTrabajadoresPorDNI(dnisArray: string[]) {
    return this.prisma.trabajador.findMany({
      where: {
        dni: { in: dnisArray },
      },
    });
  }

  // Función que inserta un trabajador en la base de datos
  async crearTrabajadorOmne(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean> {
    // 1. Buscar si ya existe el trabajador por DNI
    const existingWorker = await this.prisma.trabajador.findUnique({
      where: { dni: reqTrabajador.dni },
    });

    // 2. Si existe, hacemos un update; si no, creamos uno nuevo
    if (existingWorker) {
      console.log(
        `[ACTUALIZANDO] Trabajador DNI: ${reqTrabajador.dni} | Nombre: ${reqTrabajador.nombreApellidos}`,
      );
      // Actualizamos datos del trabajador
      const updatedTrabajador = await this.prisma.trabajador.update({
        where: { dni: reqTrabajador.dni },
        data: {
          tienda: reqTrabajador.idTienda
            ? { connect: { id: reqTrabajador.idTienda } }
            : {},
        },
      });

      // 3. Actualizar o crear el contrato
      const existingContrato = await this.prisma.contrato2.findFirst({
        where: { idTrabajador: updatedTrabajador.id },
      });

      if (existingContrato) {
        // Hacemos update del contrato
        await this.prisma.contrato2.update({
          where: { id: existingContrato.id },
          data: {
            fechaAlta: reqTrabajador.contrato.fechaAlta,
            fechaAntiguedad: reqTrabajador.contrato.fechaAntiguedad,
            horasContrato: reqTrabajador.contrato.horasContrato,
            inicioContrato: reqTrabajador.contrato.inicioContrato,
            fechaBaja: reqTrabajador.contrato.fechaBaja,
            finalContrato: reqTrabajador.contrato.finalContrato,
          },
        });
      } else {
        console.log(
          `[CREANDO] Trabajador DNI: ${reqTrabajador.dni} | Nombre: ${reqTrabajador.nombreApellidos}`,
        );
        // Creamos un contrato nuevo
        await this.prisma.contrato2.create({
          data: {
            Trabajador: { connect: { id: updatedTrabajador.id } },
            fechaAlta: reqTrabajador.contrato.fechaAlta,
            fechaAntiguedad: reqTrabajador.contrato.fechaAntiguedad,
            horasContrato: reqTrabajador.contrato.horasContrato,
            inicioContrato: reqTrabajador.contrato.inicioContrato,
            fechaBaja: reqTrabajador.contrato.fechaBaja,
            finalContrato: reqTrabajador.contrato.finalContrato,
          },
        });
      }
    } else {
      // Si no existe el trabajador, creamos uno nuevo
      const newTrabajador = await this.prisma.trabajador.create({
        data: {
          dni: reqTrabajador.dni,
          nombreApellidos: reqTrabajador.nombreApellidos,
          displayName: reqTrabajador.displayName,
          emails: reqTrabajador.emails,
          direccion: reqTrabajador.direccion,
          llevaEquipo: reqTrabajador.llevaEquipo,
          tipoTrabajador: reqTrabajador.tipoTrabajador,
          ciudad: reqTrabajador.ciudad,
          telefonos: reqTrabajador.telefonos,
          codigoPostal: reqTrabajador.codigoPostal,
          cuentaCorriente: reqTrabajador.cuentaCorriente,
          fechaNacimiento: reqTrabajador.fechaNacimiento,
          nacionalidad: reqTrabajador.nacionalidad,
          displayFoto: reqTrabajador.displayFoto,
          excedencia: reqTrabajador.excedencia,
          empresa: {
            connect: { id: reqTrabajador.idEmpresa },
          },
          responsable: reqTrabajador.idResponsable
            ? { connect: { id: reqTrabajador.idResponsable } }
            : {},
          nSeguridadSocial: reqTrabajador.nSeguridadSocial,
          tienda: reqTrabajador.idTienda
            ? { connect: { id: reqTrabajador.idTienda } }
            : {},
          roles: {
            connect: reqTrabajador.arrayRoles.map((rol) => ({ id: rol })),
          },
        },
      });

      // Creamos el contrato asociado al nuevo trabajador
      await this.prisma.contrato2.create({
        data: {
          Trabajador: { connect: { id: newTrabajador.id } },
          fechaAlta: reqTrabajador.contrato.fechaAlta,
          fechaAntiguedad: reqTrabajador.contrato.fechaAntiguedad,
          horasContrato: reqTrabajador.contrato.horasContrato,
          inicioContrato: reqTrabajador.contrato.inicioContrato,
          fechaBaja: reqTrabajador.contrato.fechaBaja,
          finalContrato: reqTrabajador.contrato.finalContrato,
        },
      });
    }

    return true;
  }

  // Función que une ambos procesos: obtener los trabajadores y guardarlos en la BD
  async sincronizarTrabajadores(): Promise<
    { message: string } | { error: string }
  > {
    const resultados = await this.getTrabajadoresOmne();
    const tiendas = await this.tiendaInstance.getTiendas();

    if (!Array.isArray(resultados)) {
      console.error("Error al obtener los resultados:", resultados);
      return {
        error: "No se han podido obtener los resultados correctamente.",
      };
    }

    for (const resultado of resultados) {
      if ("trabajadores" in resultado && resultado.trabajadores) {
        // Iteramos cada trabajador obtenido para mapear los datos y guardarlos
        for (const trabajador of resultado.trabajadores) {
          let tiendaId: number | null = null;
          if (trabajador.descripcionCentro) {
            // Reemplazamos el primer guion simple por dos guiones.
            const transformedDescripcion = trabajador.descripcionCentro.replace(
              /-/,
              "--",
            );
            // Buscamos la tienda que coincida (comparación sin distinción de mayúsculas/minúsculas)
            const foundTienda = tiendas.find(
              (tienda) =>
                tienda.nombre.toLowerCase() ===
                transformedDescripcion.toLowerCase(),
            );
            if (foundTienda) {
              tiendaId = foundTienda.id;
            }
          }

          const nuevoTrabajador: CreateTrabajadorRequestDto = {
            dni: trabajador.documento,
            nombreApellidos: trabajador.apellidosYNombre,
            displayName: trabajador.nombre,
            emails: trabajador.email,
            direccion: `${trabajador.viaPublica} ${trabajador.numero} ${trabajador.numero} ${trabajador.piso}`,
            llevaEquipo: false,
            tipoTrabajador: "DEPENDENTA",
            ciudad: trabajador.poblacion,
            telefonos: trabajador.noTelfMovilPersonal,
            codigoPostal: trabajador.cp,
            cuentaCorriente: "0",
            fechaNacimiento: null,
            nacionalidad: trabajador.codPaisNacionalidad,
            displayFoto: null,
            excedencia: false,
            idEmpresa: "a9357dca-f201-49b9-ae53-a7aba2f654c5", //POR DEFECTO ARRAZAOS
            idResponsable: null,
            nSeguridadSocial: trabajador.noAfiliacion,
            idTienda: tiendaId, // asignamos el id obtenido (o null si no se encontró)
            tokenQR: "",
            // Asignación de rol fijo; si es dinámico, ajusta el mapeo
            arrayRoles: ["b3f04be2-35f5-46d0-842b-5be49014a2ef"],
            // Mapeo del contrato; ajusta según la estructura real
            contrato: {
              fechaAlta: trabajador.altaContrato
                ? new Date(trabajador.altaContrato)
                : new Date(),
              fechaAntiguedad: trabajador.antiguedadEmpresa
                ? new Date(trabajador.antiguedadEmpresa)
                : new Date(),
              horasContrato:
                trabajador.horassemana && trabajador.horassemana > 0
                  ? Math.round((trabajador.horassemana * 100) / 40)
                  : 100,

              inicioContrato: trabajador.altaContrato
                ? new Date(trabajador.altaContrato)
                : new Date(),
              fechaBaja:
                trabajador.bajaEmpresa &&
                trabajador.bajaEmpresa.includes("0001-01-01")
                  ? null
                  : new Date(trabajador.bajaEmpresa),

              finalContrato:
                trabajador.bajaEmpresa &&
                trabajador.bajaEmpresa.includes("0001-01-01")
                  ? null
                  : new Date(trabajador.bajaEmpresa),
            },
          };

          try {
            await this.crearTrabajadorOmne(nuevoTrabajador);
          } catch (error) {
            console.error("Error al crear trabajador:", error.message);
          }
        }
      } else {
        console.log(
          `Empresa ${resultado.nombre}: ${
            "error" in resultado ? resultado.error : resultado.mensaje
          }`,
        );
      }
    }

    const newSyncDate = new Date().toISOString();
    try {
      // Supongamos que en tu parametrosService tienes un método updateParametros o updateLastSyncWorkers
      await this.parametrosService.updateParametros(
        "sincro_trabajadores",
        newSyncDate,
      );
      console.log(`Fecha de sincronización actualizada a: ${newSyncDate}`);
    } catch (error) {
      console.error(
        "Error al actualizar la fecha de sincronización:",
        error.message,
      );
      return { error: "Error al actualizar la fecha de sincronización." };
    }
    return { message: "Sincronización completada" };
  }

  async guardarTrabajadoresOmne() {
    return await this.sincronizarTrabajadores();
    // return this.tiendaInstance.getTiendas();
  }

  async getTrabajadorByAppId(uid: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp: uid,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
        tienda: true,
        roles: true,
        responsable: true,
      },
    });

    return trabajador;
  }

  async crearTrabajadorInterno(trabajador: Prisma.TrabajadorCreateInput) {
    return await this.prisma.trabajador.create({
      data: trabajador,
    });
  }

  async getTrabajadorBySqlId(id: number) {
    if (!id)
      throw new InternalServerErrorException(
        "id no definido en getTrabajadorBySqlId (trabajadores.database.ts)",
      );

    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: id,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
        responsable: true,
        tienda: true,
      },
    });

    return trabajador;
  }

  async getTrabajadorByDni(dni: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        dni: dni,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
      },
    });

    return trabajador;
  }

  async getTrabajadores() {
    // Esta función tenía el todos = false)
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        // Filtra para incluir solo trabajadores con al menos un contrato vigente
        contratos: {
          some: {
            fechaBaja: null, // Contrato aún vigente
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
        responsable: true,
        tienda: true,
        roles: true,
        permisos: true,
        empresa: true,
      },
      orderBy: {
        nombreApellidos: "asc",
      },
    });

    return trabajadores;
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: idTrabajador,
        tokenQR: tokenQR,
        contratos: {
          some: {
            fechaBaja: null,
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    if (!trabajador || trabajador.tokenQR !== tokenQR) {
      return null;
    }

    return trabajador;
  }

  async getTrabajadoresByTienda(idTienda: number) {
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        idTienda: idTienda,
        contratos: {
          some: {
            fechaBaja: null,
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    return trabajadores;
  }

  async getSubordinadosConTienda(idAppResponsable: string) {
    // Encuentra el id del responsable usando idApp
    const responsable = await this.prisma.trabajador.findUnique({
      where: {
        idApp: idAppResponsable,
      },
      select: {
        id: true,
      },
    });

    if (!responsable) return [];

    // Obtén los trabajadores subordinados
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: responsable.id,
        idTienda: {
          not: null,
        },
      },
      include: {
        tienda: true,
        responsable: {
          select: {
            idApp: true,
          },
        },
      },
    });

    // Calcula llevaEquipo para cada trabajador
    const trabajadoresConLlevaEquipo = await Promise.all(
      trabajadores.map(async (trabajador) => {
        const conteo = await this.prisma.trabajador.count({
          where: {
            idResponsable: trabajador.id,
          },
        });

        return {
          ...trabajador,
          llevaEquipo: conteo > 0,
          nombreTienda: trabajador.tienda?.nombre,
          validador: trabajador.responsable?.idApp,
        };
      }),
    );

    return trabajadoresConLlevaEquipo;
  }

  async esCoordinadora(uid: string) {
    // Ahora no tiene en cuenta el campo "llevaEquipo"

    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp: uid,
      },
      // Incluye información relacionada
      include: {
        responsable: {
          select: {
            id: true,
          },
        },
        subordinados: {
          select: {
            id: true,
          },
        },
      },
    });

    // Verifica si el trabajador existe y si tiene subordinados
    if (
      trabajador &&
      trabajador.subordinados &&
      trabajador.subordinados.length > 0
    ) {
      return true;
    }
    return false;
  }
  async esCoordinadoraPorId(id: number) {
    // Ahora no tiene en cuenta el campo "llevaEquipo"

    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: id,
      },
      // Incluye información relacionada
      include: {
        responsable: {
          select: {
            id: true,
          },
        },
        subordinados: {
          select: {
            id: true,
          },
        },
      },
    });

    // Verifica si el trabajador existe y si tiene subordinados
    if (
      trabajador &&
      trabajador.subordinados &&
      trabajador.subordinados.length > 0
    ) {
      return true;
    }
    return false;
  }

  async getSubordinados(idApp: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    if (!trabajador) return [];

    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: trabajador.id,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });
    if (!subordinados.some((sub) => sub.id === trabajador.id)) {
      subordinados.push(trabajador);
    }

    return subordinados;
  }

  async getSubordinadosById(id: number, conFecha?: DateTime) {
    if (!conFecha) {
      conFecha = DateTime.now();
    }

    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: id,
        contratos: {
          some: {
            AND: [
              {
                fechaAlta: {
                  lte: conFecha.toJSDate(),
                },
              },
              {
                OR: [
                  {
                    fechaBaja: {
                      gte: conFecha.toJSDate(),
                    },
                  },
                  {
                    fechaBaja: null,
                  },
                ],
              },
            ],
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    return subordinados;
  }

  async getSubordinadosConTiendaPorId(idResponsable: number) {
    // Obtén los trabajadores subordinados
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: idResponsable,
        idTienda: {
          not: null,
        },
      },
      include: {
        tienda: true,
        responsable: {
          select: {
            idApp: true,
          },
        },
      },
    });

    // Calcula llevaEquipo para cada trabajador
    const trabajadoresConLlevaEquipo = await Promise.all(
      trabajadores.map(async (trabajador) => {
        const conteo = await this.prisma.trabajador.count({
          where: {
            idResponsable: trabajador.id,
          },
        });

        return {
          ...trabajador,
          llevaEquipo: conteo,
          nombreTienda: trabajador.tienda?.nombre,
          validador: trabajador.responsable?.idApp,
        };
      }),
    );

    return trabajadoresConLlevaEquipo;
  }

  async getSubordinadosByIdsql(id: number) {
    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: id,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
      },
    });

    return subordinados;
  }

  async getSubordinadosByIdNew(id: number, conFecha?: DateTime) {
    return await this.getSubordinadosById(id, conFecha);
  }

  isValidDate(value) {
    return DateTime.fromFormat(value, "DD/MM/YYYY").isValid;
  }

  isValidUsuario(usuario) {
    return (
      this.isValidDate(usuario.inicioContrato) &&
      this.isValidDate(usuario.antiguedad) &&
      usuario.dni &&
      usuario.dni !== "" &&
      usuario.telefonos &&
      usuario.telefonos !== ""
    );
  }

  async setIdApp(idSql: number, uid: string) {
    await this.prisma.trabajador.update({
      where: {
        id: idSql,
      },
      data: {
        idApp: uid,
      },
    });
  }

  async actualizarUsuarios(usuariosNuevos: any[], modificarEnApp: any[]) {
    const usuariosNoActualizadosNuevos = [];
    const usuariosNoActualizadosApp = [];

    // INSERT
    const usuariosNuevosValidos = usuariosNuevos.filter((usuario) => {
      const isValid = this.isValidUsuario(usuario) && !usuario.finalContrato;
      if (!isValid) usuariosNoActualizadosNuevos.push(usuario);
      return isValid;
    });

    // UPDATE
    const modificarEnAppValidos = modificarEnApp.filter((usuario) => {
      const isValid = this.isValidUsuario(usuario);
      if (!isValid) usuariosNoActualizadosApp.push(usuario);
      return isValid;
    });

    await this.prisma.trabajador.createMany({
      data: usuariosNuevosValidos.map((usuario) => {
        return {
          id: usuario.id,
          idApp: usuario.idApp,
          nombreApellidos: usuario.nombreApellidos,
          displayName: usuario.displayName,
          emails: usuario.emails,
          dni: usuario.dni,
          direccion: usuario.direccion,
          ciudad: usuario.ciudad,
          telefonos: usuario.telefonos,
          fechaNacimiento: DateTime.fromFormat(
            usuario.fechaNacimiento,
            "dd/MM/yyyy",
          ).toJSDate(),
          nacionalidad: usuario.nacionalidad,
          nSeguridadSocial: usuario.nSeguridadSocial,
          codigoPostal: usuario.codigoPostal,
          cuentaCorriente: usuario.cuentaCorriente,
          tipoTrabajador: usuario.tipoTrabajador,
          llevaEquipo: false,
        };
      }),
      skipDuplicates: true,
    });

    await this.prisma.trabajador.updateMany({
      where: {
        id: {
          in: modificarEnAppValidos.map((usuario) => usuario.id),
        },
      },
      data: modificarEnAppValidos.map((usuario) => {
        return {
          nombreApellidos: usuario.nombreApellidos,
          dni: usuario.dni,
        };
      }),
    });

    return {
      usuariosNoActualizadosNuevos,
      usuariosNoActualizadosApp,
    };
  }

  async eliminarUsuarios(usuariosAEliminar: any[]) {
    await this.prisma.trabajador.deleteMany({
      where: {
        id: {
          in: usuariosAEliminar.map((usuario) => usuario.id),
        },
      },
    });
  }

  async getResponsableTienda(idTienda: number) {
    const responsable = await this.prisma.trabajador.findFirst({
      where: {
        idTienda: idTienda,
        llevaEquipo: true,
      },
    });

    return responsable;
  }

  async sqlHandleCambios(
    modificado: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  ) {
    if (modificado.idResponsable != original.idResponsable) {
      if (modificado.idTienda != original.idTienda)
        throw Error(
          "No es posible cambiar el responsable y la tienda a la vez",
        );
    }

    if (original.llevaEquipo && !modificado.llevaEquipo) {
      // Establecer en este caso el idResponsable a null de los subordinados primero y luego  modificar el llevaEquipo
      await this.prisma.trabajador.updateMany({
        where: {
          responsable: {
            id: modificado.id,
          },
        },
        data: {
          idResponsable: null,
        },
      });
    }

    if (modificado.llevaEquipo && modificado.idTienda) {
      await this.prisma.trabajador.updateMany({
        where: {
          idTienda: modificado.idTienda,
          NOT: {
            id: modificado.id,
          },
        },
        data: {
          idResponsable: modificado.id,
        },
      });
    }

    if (modificado.idTienda != original.idTienda) {
      // Si se cambia la tienda
      if (modificado.llevaEquipo && original.llevaEquipo) {
        // Si antes llevaba equipo y ahora también
        await this.prisma.trabajador.updateMany({
          where: {
            responsable: {
              id: modificado.id,
            },
          },
          data: {
            idResponsable: null,
          },
        });
        // Falta 'C'
      }
    }
  }

  async guardarCambiosForm(
    trabajador: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  ) {
    await this.sqlHandleCambios(trabajador, original);

    const payload: Prisma.TrabajadorUpdateInput = {
      nombreApellidos: trabajador.nombreApellidos,
      displayName: trabajador.displayName,
      emails: trabajador.emails,
      dni: trabajador.dni,
      direccion: trabajador.direccion,
      ciudad: trabajador.ciudad,
      telefonos: trabajador.telefonos,
      fechaNacimiento: trabajador.fechaNacimiento,
      nacionalidad: trabajador.nacionalidad,
      nSeguridadSocial: trabajador.nSeguridadSocial,
      codigoPostal: trabajador.codigoPostal,
      cuentaCorriente: trabajador.cuentaCorriente,
      responsable: {
        connect: { id: trabajador.idResponsable },
      },
      tienda: {
        connect: { id: trabajador.idTienda },
      },
      llevaEquipo: trabajador.llevaEquipo ? true : false,
      tokenQR: trabajador.tokenQR,
      empresa: {
        connect: { id: trabajador.empresaId },
      },
      tipoTrabajador: trabajador.tipoTrabajador,
      roles: {
        set: trabajador.arrayRoles.map((rol) => {
          return {
            id: rol,
          };
        }),
      },
    };

    if (!trabajador.idTienda) {
      delete payload.tienda;
    }
    if (!trabajador.idResponsable) {
      delete payload.responsable;
    }

    if (trabajador.arrayRoles.length === 0 || trabajador.arrayRoles[0] === "") {
      delete payload.roles;
      await this.prisma
        .$queryRaw`DELETE FROM "_RoleToTrabajador" WHERE "B" = ${trabajador.id}`;
    }

    await this.prisma.trabajador.update({
      where: {
        id: trabajador.id,
      },
      data: payload,
    });
    return true;
  }

  async getNivelMenosUno(idSql: number) {
    const resResponsable = await this.prisma.trabajador.findFirst({
      where: {
        id: idSql,
      },
      select: {
        idResponsable: true,
      },
    });

    if (!resResponsable.idResponsable) return null;

    const responsable = await this.prisma.trabajador.findUnique({
      where: {
        id: resResponsable.idResponsable,
      },
    });

    return responsable;
  }

  async getNivelUno(idSql: number) {
    return await this.prisma.trabajador.findMany({
      where: {
        idResponsable: idSql,
      },
    });
  }

  async getNivelCero(idSql: number) {
    return await this.getTrabajadorBySqlId(idSql);
  }

  async borrarTrabajador(idSql: number) {
    await this.prisma.trabajador.delete({
      where: {
        id: idSql,
      },
    });
    return true;
  }

  async getCoordinadoras() {
    return await this.prisma.trabajador.findMany({
      where: {
        llevaEquipo: true,
        idTienda: {
          not: null,
        },
      },
    });
  }

  async uploadFoto(displayFoto: string, uid: string) {
    const resUpdate = await this.prisma.trabajador.update({
      where: {
        idApp: uid,
      },
      data: {
        displayFoto: displayFoto,
      },
    });

    if (resUpdate) return resUpdate;
    return null;
  }

  async deleteTrabajador(idSql: number) {
    // Borrar trabajador
    return await this.prisma.trabajador.delete({
      where: {
        id: idSql,
      },
    });
  }
}
