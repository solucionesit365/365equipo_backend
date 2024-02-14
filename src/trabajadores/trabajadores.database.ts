import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { TrabajadorCompleto } from "./trabajadores.interface";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
import { Prisma } from "@prisma/client";
import { TrabajadorFormRequest } from "./trabajadores.dto";

@Injectable()
export class TrabajadorDatabaseService {
  constructor(
    private prisma: PrismaService,
    private readonly hitMssqlService: HitMssqlService,
  ) {}

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
    subordinados[0].contratos;
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
    const trabajador = await this.prisma.trabajador.update({
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

  // async sqlHandleCambios(
  //   modificado: TrabajadorCompleto,
  //   original: TrabajadorCompleto,
  // ) {
  //   if (modificado.idResponsable != original.idResponsable) {
  //     if (modificado.idTienda != original.idTienda)
  //       throw Error(
  //         "No es posible cambiar el responsable y la tienda a la vez",
  //       );

  //     if (original.llevaEquipo && !modificado.llevaEquipo) {
  //       await this.prisma.trabajador.updateMany({
  //         where: {
  //           responsable: {
  //             id: modificado.id,
  //           },
  //         },
  //         data: {
  //           idResponsable: null,
  //         },
  //       });
  //     } else if (modificado.llevaEquipo && modificado.idTienda) {
  //       await this.prisma.trabajador.update({
  //         where: {
  //           idTienda: modificado.idTienda,
  //           id: modificado.id,
  //           llevaEquipo: false,
  //         },
  //         data: {
  //           idResponsable: modificado.id,
  //         },
  //       });
  //     }
  //   } else if (modificado.idTienda != original.idTienda) {
  //     if (modificado.llevaEquipo && original.llevaEquipo) {
  //       await this.prisma.trabajador.updateMany({
  //         where: {
  //           responsable: {
  //             id: modificado.id,
  //           },
  //         },
  //         data: {
  //           idResponsable: null,
  //         },
  //       });

  //       await this.prisma.trabajador.update({
  //         where: {
  //           idTienda: modificado.idTienda,
  //           id: modificado.id,
  //           llevaEquipo: false,
  //         },

  //         data: {
  //           idResponsable: modificado.id,
  //         },
  //       });

  //       // Falta 'C'
  //     }
  //   } else if (modificado.llevaEquipo && modificado.idTienda) {
  //     await this.prisma.trabajador.update({
  //       where: {
  //         idTienda: modificado.idTienda,
  //         id: modificado.id,
  //         llevaEquipo: false,
  //       },
  //       data: {
  //         idResponsable: modificado.id,
  //       },
  //     });
  //   } else if (!modificado.llevaEquipo && original.llevaEquipo) {
  //     await this.prisma.trabajador.updateMany({
  //       where: {
  //         responsable: {
  //           id: modificado.id,
  //         },
  //       },
  //       data: {
  //         idResponsable: null,
  //       },
  //     });
  //   }
  // }

  async guardarCambiosForm(
    trabajador: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  ) {
    await this.sqlHandleCambios(trabajador, original);

    const response = await this.prisma.trabajador.update({
      where: {
        id: trabajador.id,
      },
      data: {
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
        idResponsable: trabajador.idResponsable,
        idTienda: trabajador.idTienda,
        llevaEquipo: trabajador.llevaEquipo ? true : false,
        tokenQR: trabajador.tokenQR,
      },
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

  async getTrabajadoresSage(): Promise<
    {
      id: number;
      nombreApellidos: string;
      displayName: string;
      emails: string;
      dni: string;
      direccion: string;
      ciudad: string;
      telefonos: string;
      fechaNacimiento: string;
      nacionalidad: string;
      nSeguridadSocial: string;
      codigoPostal: string;
      cuentaCorriente: string;
      tipoTrabajador: string;
      inicioContrato: string;
      finalContrato: string;
      antiguedad: string;
      idEmpresa: number;
    }[]
  > {
    const sqlQuery = ` 
	WITH CTE_Resultado AS (
    SELECT
      de.CODI as id,
      de.NOM as nombreApellidos,
      de.MEMO as displayName,
    de2.valor as emails,
      pe.Dni as dni,
    de3.valor as direccion,
    de4.valor as ciudad,
    de5.valor as telefonos,
    de6.valor as fechaNacimiento,
    de7.valor as nacionalidad,
      pe.ProvNumSoe as nSeguridadSocial,
    de8.valor as codigoPostal,
      ec.IBANReceptor as cuentaCorriente,
    de9.valor as tipoTrabajador,
      CONVERT(nvarchar, en.FechaAlta, 103) as inicioContrato,
      CONVERT(nvarchar, en.FechaBaja, 103) as finalContrato,
      CONVERT(nvarchar, en.FechaAntiguedad, 103) as antiguedad,
      en.CodigoEmpresa as idEmpresa,
      ROW_NUMBER() OVER (PARTITION BY pe.Dni ORDER BY (SELECT NULL)) AS RowNumber
    FROM silema_ts.sage.dbo.Personas pe
    LEFT JOIN silema_ts.sage.dbo.EmpleadoCobro ec ON pe.dni = ec.IDBeneficiario
    LEFT JOIN silema_ts.sage.dbo.EmpleadoNomina en ON pe.dni = en.Dni
    LEFT JOIN silema_ts.sage.dbo.Empresas em ON em.CodigoEmpresa = en.CodigoEmpresa
    LEFT JOIN dependentesExtes de1 ON de1.nom = 'DNI' AND de1.valor COLLATE SQL_Latin1_General_CP1_CI_AS = pe.Dni
    LEFT JOIN dependentesExtes de2 ON de1.id = de2.id AND de2.nom = 'EMAIL'
    LEFT JOIN dependentesExtes de3 ON de1.id = de3.id AND de3.nom = 'ADRESA'
    LEFT JOIN dependentesExtes de4 ON de1.id = de4.id AND de4.nom = 'CIUTAT'
    LEFT JOIN dependentesExtes de5 ON de1.id = de5.id AND de5.nom = 'TLF_MOBIL'
    LEFT JOIN dependentesExtes de6 ON de1.id = de6.id AND de6.nom = 'DATA_NAIXEMENT'
    LEFT JOIN dependentesExtes de7 ON de1.id = de7.id AND de7.nom = 'NACIONALITAT'
    LEFT JOIN dependentesExtes de8 ON de1.id = de8.id AND de8.nom = 'CODIGO POSTAL'
    LEFT JOIN dependentesExtes de9 ON de1.id = de9.id AND de9.nom = 'TIPUSTREBALLADOR'
    LEFT JOIN dependentes de ON de.CODI = de1.id
    
  
    WHERE 
    en.FechaAlta IS NOT NULL AND en.FechaBaja IS NULL
    AND en.CodigoEmpresa IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15) 
    AND de.CODI IS NOT NULL 
  )
  SELECT *
  FROM CTE_Resultado
  WHERE RowNumber = 1
  ORDER BY nombreApellidos;
  
`;
    const resTrabajadores = await this.hitMssqlService.recHit(sqlQuery);
    // if (resTrabajadores.recordset.length > 0) return resTrabajadores.recordset;
    // else
    throw Error("Error, no hay trabajadores");
  }
}
