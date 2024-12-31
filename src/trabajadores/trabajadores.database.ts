import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";

@Injectable()
export class TrabajadorDatabaseService {
  constructor(private prisma: PrismaService) {}

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

    if (trabajador.tokenQR === tokenQR) {
      return true;
    } else {
      return false;
    }
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
      select: {
        id: true,
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
