import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";
import { ParametrosService } from "../parametros/parametros.service";
import { Tienda } from "../tiendas/tiendas.class";
import pMap = require("p-map");
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";
import { AxiosBcService } from "../axios/axios-bc.service";

export interface TIncludeTrabajador {
  contratos?: boolean;
  responsable?: boolean;
  tienda?: boolean;
  roles?: boolean;
  permisos?: boolean;
  empresa?: boolean;
}

@Injectable()
export class TrabajadorDatabaseService {
  constructor(
    private prisma: PrismaService,
    private readonly parametrosService: ParametrosService,
    private readonly tiendaInstance: Tienda,
    private readonly axiosBCService: AxiosBcService,
  ) {}

  async crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
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

  async createManyTrabajadores(arrayNuevosTrabajadores: any[]) {
    try {
      // Filter out duplicates by DNI to avoid unique constraint violations
      const uniqueDnisMap = new Map();
      const filteredTrabajadores = [];

      for (const trabajador of arrayNuevosTrabajadores) {
        if (!uniqueDnisMap.has(trabajador.dni)) {
          uniqueDnisMap.set(trabajador.dni, trabajador);
          filteredTrabajadores.push(trabajador);
        } else {
          console.log(`Skipping duplicate DNI: ${trabajador.dni}`);
        }
      }

      // Process in smaller batches to avoid transaction timeouts
      const BATCH_SIZE = 10;
      const batches = [];
      for (let i = 0; i < filteredTrabajadores.length; i += BATCH_SIZE) {
        batches.push(filteredTrabajadores.slice(i, i + BATCH_SIZE));
      }

      let allResults = [];

      // Counters for different actions
      let created = 0;
      let updated = 0;
      let unchanged = 0;
      let failed = 0;

      // Process each batch sequentially
      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (trabajador) => {
            try {
              // Check if trabajador already exists with this DNI
              const existingTrabajador =
                await this.prisma.trabajador.findUnique({
                  where: { dni: trabajador.dni },
                  include: { contratos: true },
                });

              if (existingTrabajador) {
                // Check if the data has actually changed
                let hasChanges = false;
                const fieldsToCompare = [
                  "nombreApellidos",
                  "emails",
                  "telefonos",
                  "direccion",
                  "ciudad",
                  "nacionalidad",
                  "codigoPostal",
                  "nSeguridadSocial",
                  "tipoTrabajador",
                ];

                for (const field of fieldsToCompare) {
                  if (
                    trabajador[field] !== undefined &&
                    trabajador[field] !== null &&
                    existingTrabajador[field] !== trabajador[field]
                  ) {
                    hasChanges = true;
                    break;
                  }
                }

                // Check if contract data has changed
                const contratoData = trabajador.contratos?.create;
                const existingContrato = existingTrabajador.contratos?.[0];

                let contratoHasChanges = false;
                if (contratoData && existingContrato) {
                  const contractFieldsToCompare = [
                    ["fechaAlta", "fechaAlta"],
                    ["fechaAntiguedad", "fechaAntiguedad"],
                    ["horasContrato", "horasContrato"],
                    ["inicioContrato", "inicioContrato"],
                    ["fechaBaja", "fechaBaja"],
                    ["finalContrato", "finalContrato"],
                  ];

                  for (const [
                    newField,
                    existingField,
                  ] of contractFieldsToCompare) {
                    // Compare dates by timestamp or direct comparison for numbers
                    const newValue =
                      contratoData[newField] instanceof Date
                        ? contratoData[newField].getTime()
                        : contratoData[newField];

                    const existingValue =
                      existingContrato[existingField] instanceof Date
                        ? existingContrato[existingField].getTime()
                        : existingContrato[existingField];

                    if (
                      newValue !== existingValue &&
                      !(newValue === null && existingValue === null)
                    ) {
                      contratoHasChanges = true;
                      break;
                    }
                  }
                } else if (contratoData && !existingContrato) {
                  // No existing contract but we have contract data to add
                  contratoHasChanges = true;
                }

                if (hasChanges || contratoHasChanges) {
                  console.log(
                    `Trabajador with DNI ${trabajador.dni} has changes. Updating...`,
                  );

                  // Update existing trabajador only if there are changes
                  if (hasChanges) {
                    await this.prisma.trabajador.update({
                      where: { dni: trabajador.dni },
                      data: {
                        nombreApellidos: trabajador.nombreApellidos,
                        emails: trabajador.emails,
                        telefonos: trabajador.telefonos,
                        direccion: trabajador.direccion,
                        ciudad: trabajador.ciudad,
                        nacionalidad: trabajador.nacionalidad,
                        codigoPostal: trabajador.codigoPostal,
                        nSeguridadSocial: trabajador.nSeguridadSocial,
                        fechaNacimiento: trabajador.fechaNacimiento,
                        llevaEquipo: trabajador.llevaEquipo,
                        tipoTrabajador: trabajador.tipoTrabajador,
                      },
                    });
                  }

                  // Create or update contract if there are changes
                  if (contratoData && contratoHasChanges) {
                    if (existingContrato) {
                      await this.prisma.contrato2.update({
                        where: { id: existingContrato.id },
                        data: {
                          horasContrato: contratoData.horasContrato,
                          inicioContrato: contratoData.inicioContrato,
                          finalContrato: contratoData.finalContrato,
                          fechaAlta: contratoData.fechaAlta,
                          fechaAntiguedad: contratoData.fechaAntiguedad,
                          fechaBaja: contratoData.fechaBaja,
                        },
                      });
                    } else {
                      // Create new contract but generate a new UUID instead of using the one provided
                      await this.prisma.contrato2.create({
                        data: {
                          // Exclude the id field to let Prisma generate a new one
                          Trabajador: {
                            connect: { id: existingTrabajador.id },
                          },
                          fechaAlta: contratoData.fechaAlta,
                          fechaAntiguedad: contratoData.fechaAntiguedad,
                          horasContrato: contratoData.horasContrato,
                          inicioContrato: contratoData.inicioContrato,
                          fechaBaja: contratoData.fechaBaja,
                          finalContrato: contratoData.finalContrato,
                        },
                      });
                    }
                  }

                  updated++;
                  return {
                    success: true,
                    dni: trabajador.dni,
                    action: "updated",
                  };
                } else {
                  console.log(
                    `Trabajador with DNI ${trabajador.dni} already exists and no changes detected.`,
                  );
                  unchanged++;
                  return {
                    success: true,
                    dni: trabajador.dni,
                    action: "unchanged",
                  };
                }
              } else {
                // Create new trabajador without using transaction to avoid timeouts
                console.log(
                  `Creating new trabajador with DNI ${trabajador.dni}`,
                );

                // 1. Create the trabajador
                const newTrabajador = await this.prisma.trabajador.create({
                  data: {
                    dni: trabajador.dni,
                    nombreApellidos: trabajador.nombreApellidos,
                    emails: trabajador.emails,
                    telefonos: trabajador.telefonos,
                    direccion: trabajador.direccion,
                    ciudad: trabajador.ciudad,
                    nacionalidad: trabajador.nacionalidad,
                    codigoPostal: trabajador.codigoPostal,
                    nSeguridadSocial: trabajador.nSeguridadSocial,
                    fechaNacimiento: trabajador.fechaNacimiento,
                    llevaEquipo:
                      trabajador.llevaEquipo !== undefined
                        ? trabajador.llevaEquipo
                        : false,
                    tipoTrabajador: trabajador.tipoTrabajador,
                    empresa: trabajador.idEmpresa
                      ? {
                          connect: { id: trabajador.idEmpresa },
                        }
                      : undefined,
                  },
                });

                // 2. Create the contrato if it exists
                if (trabajador.contratos && trabajador.contratos.create) {
                  const contratoData = trabajador.contratos.create;

                  // Create contract with a new UUID, not using the provided ID
                  await this.prisma.contrato2.create({
                    data: {
                      // Do NOT use contratoData.id - let Prisma generate a new UUID
                      Trabajador: {
                        connect: { id: newTrabajador.id },
                      },
                      fechaAlta: contratoData.fechaAlta,
                      fechaAntiguedad: contratoData.fechaAntiguedad,
                      horasContrato: contratoData.horasContrato,
                      inicioContrato: contratoData.inicioContrato,
                      fechaBaja: contratoData.fechaBaja,
                      finalContrato: contratoData.finalContrato,
                    },
                  });
                }

                created++;
                return {
                  success: true,
                  dni: trabajador.dni,
                  action: "created",
                  id: newTrabajador.id,
                };
              }
            } catch (error) {
              console.error(
                `Error processing trabajador with DNI ${trabajador.dni}:`,
                error,
              );
              failed++;
              return {
                success: false,
                dni: trabajador.dni,
                error: error.message,
              };
            }
          }),
        );

        allResults = [...allResults, ...batchResults];

        // Add a small delay between batches to prevent database overload
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log(
        `Completed batch operation: ${created} created, ${updated} updated, ${unchanged} unchanged, ${failed} failed`,
      );

      return {
        message: `Processed ${allResults.length} workers: ${created} created, ${updated} updated, ${unchanged} unchanged, ${failed} failed`,
        details: allResults,
        stats: { created, updated, unchanged, failed },
      };
    } catch (error) {
      console.error("Error in createManyTrabajadores:", error);
      throw new InternalServerErrorException(
        `Failed to create/update workers: ${error.message}`,
      );
    }
  }
  async actualizarTrabajadoresLote(
    trabajadoresData: Array<{
      dni: string;
      cambios?: any;
      nuevoContrato?: any;
    }>,
  ) {
    try {
      // Dividir en lotes pequeños para evitar sobrecarga
      const BATCH_SIZE = 5;
      const chunks = [];

      for (let i = 0; i < trabajadoresData.length; i += BATCH_SIZE) {
        chunks.push(trabajadoresData.slice(i, i + BATCH_SIZE));
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [],
        details: [],
      };

      // Procesar cada lote secuencialmente, nunca en paralelo
      for (const chunk of chunks) {
        // Para cada trabajador en el lote, procesar uno por uno (no en transacción)
        for (const { dni, cambios, nuevoContrato } of chunk) {
          try {
            // 1. Buscar el trabajador
            const trabajador = await this.prisma.trabajador.findUnique({
              where: { dni },
              include: { contratos: true },
            });

            if (!trabajador) {
              results.failed++;
              results.errors.push({
                dni,
                error: `Trabajador con DNI ${dni} no encontrado`,
              });
              continue;
            }

            // 2. Actualizar el trabajador si hay cambios
            if (cambios && Object.keys(cambios).length > 0) {
              await this.prisma.trabajador.update({
                where: { dni },
                data: cambios,
              });
            }

            // 3. Crear o actualizar contrato si es necesario
            if (nuevoContrato) {
              const contratoExistente = trabajador.contratos?.[0];

              if (contratoExistente) {
                // Actualizar contrato existente
                await this.prisma.contrato2.update({
                  where: { id: contratoExistente.id },
                  data: {
                    horasContrato: nuevoContrato.horasContrato,
                    inicioContrato: nuevoContrato.inicioContrato,
                    finalContrato: nuevoContrato.finalContrato,
                    fechaAlta: nuevoContrato.fechaAlta,
                    fechaAntiguedad: nuevoContrato.fechaAntiguedad,
                    fechaBaja: nuevoContrato.fechaBaja,
                  },
                });
              } else {
                // Crear nuevo contrato
                await this.prisma.contrato2.create({
                  data: {
                    ...nuevoContrato,
                    Trabajador: {
                      connect: { id: trabajador.id },
                    },
                  },
                });
              }
            }

            results.successful++;
            results.details.push({ dni, status: "success" });
          } catch (error) {
            console.error(`Error al actualizar trabajador ${dni}:`, error);
            results.failed++;
            results.errors.push({ dni, error: error.message });
          }

          // Pequeña pausa entre actualizaciones para reducir carga en DB
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        // Pausa entre lotes
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return results;
    } catch (error) {
      console.error("Error en actualizarTrabajadoresLote:", error);
      throw new InternalServerErrorException(
        `Error al actualizar trabajadores: ${error.message}`,
      );
    }
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

      // // Obtener parámetros (incluida la fecha de sincronización)
      // const parametros = await this.parametrosService.getParametros(
      //   "sincro_trabajadores",
      // );
      // console.log(
      //   "Última fecha de sincronización: " +
      //     DateTime.fromJSDate(parametros[0].lastSyncWorkers).toISO(),
      // );

      // if (!parametros[0].lastSyncWorkers) {
      //   // Retornamos un array con el error para que el caller pueda iterar sin problemas.
      //   return [
      //     { error: "No se ha encontrado la última fecha de sincronización." },
      //   ];
      // }

      // Ejecutar las consultas en paralelo para cada empresa
      const resultados = await Promise.all(
        empresas.map(async ({ empresaID, nombre }) => {
          const response = await this.axiosBCService.getAxios().get(
            `Production/api/Miguel/365ObradorAPI/v1.0/companies(${empresaID})/perceptoresQuery`,
            // ?$filter=SystemModifiedAt gt ${lastSyncWorkers
            //   .toUTC()
            //   .toISO()}`,
          );

          const responseFechaNacimiento = await this.axiosBCService
            .getAxios()
            .get(
              `Production/api/eze/365ObradorAPI/v1.0/companies(${empresaID})/PerceptorsExtraData`,
            );

          const trabajadores = response.data.value.map((trabajador) => {
            const trabajadorRelacionado =
              responseFechaNacimiento.data.value.find(
                (extraData) => extraData.noPerceptor === trabajador.noPerceptor,
              );

            let fechaNacimiento = null;

            if (trabajadorRelacionado.fechaNacimiento) {
              if (trabajadorRelacionado.fechaNacimiento != "0001-01-01") {
                fechaNacimiento = DateTime.fromFormat(
                  trabajadorRelacionado.fechaNacimiento,
                  "yyyy-MM-dd",
                );
              }
            }

            return {
              ...trabajador,
              fechaNacimiento,
            };
          });
          return trabajadores.length === 0
            ? {
                empresaID,
                nombre,
                mensaje: "No hay trabajadores nuevos ni actualizaciones.",
              }
            : { empresaID, nombre, trabajadores };
        }),
      );

      return resultados;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  // async getPerceptoresExtraData() {

  // }

  // Update Many con diferentes valores a modificar

  async updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ) {
    const CHUNK_SIZE = 300;
    const CONCURRENCY = 3;

    // Fragmenta el array en trozos de CHUNK_SIZE
    const chunks: (typeof modificaciones)[] = [];
    for (let i = 0; i < modificaciones.length; i += CHUNK_SIZE) {
      chunks.push(modificaciones.slice(i, i + CHUNK_SIZE));
    }

    // Procesa cada chunk en paralelo (máx CONCURRENCY pendientes)
    await pMap(
      chunks,
      async (chunk) => {
        await this.prisma.$transaction(
          chunk.map(({ dni, cambios, nuevoContrato }) =>
            this.prisma.trabajador.update({
              where: { dni },
              data: {
                ...cambios,
                contratos: {
                  // borra los antiguos
                  deleteMany: {},
                  // crea el nuevo contrato
                  create: {
                    fechaAlta: nuevoContrato.fechaAlta,
                    fechaAntiguedad: nuevoContrato.fechaAntiguedad,
                    horasContrato: nuevoContrato.horasContrato,
                    inicioContrato: nuevoContrato.inicioContrato,
                    fechaBaja: nuevoContrato.fechaBaja ?? null,
                    finalContrato: nuevoContrato.finalContrato ?? null,
                    // …otros campos si los hubiera
                  },
                },
              },
            }),
          ),
        );
      },
      { concurrency: CONCURRENCY },
    );

    return { updated: modificaciones.length };
  }

  // Método para actualizar contratos
  async updateManyContratos(
    contratosModificaciones: Array<{
      contratoId: string;
      horasContrato: number;
    }>,
  ) {
    if (!contratosModificaciones || contratosModificaciones.length === 0) {
      return [];
    }

    return await this.prisma.$transaction(
      contratosModificaciones.map(({ contratoId, horasContrato }) =>
        this.prisma.contrato2.update({
          where: { id: contratoId },
          data: { horasContrato },
        }),
      ),
    );
  }

  deleteManyTrabajadores(dnis: { dni: string }[]) {
    return this.prisma.trabajador.deleteMany({
      where: {
        dni: { in: dnis.map((dni) => dni.dni) },
      },
    });
  }

  normalizarDNIs() {
    return this.prisma.$executeRawUnsafe(`
      UPDATE "Trabajador"
      SET "dni" = UPPER(
        REGEXP_REPLACE("dni", '\\s+', '', 'g')
      );
    `);
    //   return this.prisma.$queryRaw`
    // SELECT UPPER(REGEXP_REPLACE(dni, '\\s+', '', 'g')) AS norm,
    //        COUNT(*) AS cnt
    // FROM "Trabajador"
    // GROUP BY norm
    // HAVING COUNT(*) > 1;
    // `;
  }

  getTrabajadoresPorDNI(dnisArray: string[]) {
    return this.prisma.trabajador.findMany({
      where: {
        dni: { in: dnisArray },
      },
    });
  }

  async getAllTrabajadores(include: TIncludeTrabajador): Promise<
    Prisma.TrabajadorGetPayload<{
      include: {
        contratos?: true;
        responsable?: true;
        tienda?: true;
        roles?: true;
        permisos?: true;
        empresa?: true;
      };
    }>[]
  > {
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
        contratos: include.contratos
          ? {
              where: {
                fechaBaja: null, // Para contratos aún vigentes
              },
              orderBy: {
                fechaAlta: "desc", // Ordena por la fecha más reciente
              },
              take: 1, // Toma solo el contrato más reciente
            }
          : false,
        responsable: include.responsable || false,
        tienda: include.tienda || false,
        roles: include.roles || false,
        permisos: include.permisos || false,
        empresa: include.empresa || false,
      },
      orderBy: {
        nombreApellidos: "asc",
      },
    });

    return trabajadores;
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
            connect: { id: "b3f04be2-35f5-46d0-842b-5be49014a2ef" }, // Rol dependienta
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

  // // Función que une ambos procesos: obtener los trabajadores y guardarlos en la BD
  // async sincronizarTrabajadores(): Promise<
  //   { message: string } | { error: string }
  // > {
  //   try {
  //     const resultados = await this.getTrabajadoresOmne();
  //     const tiendas = await this.tiendaInstance.getTiendas();

  //     if (!Array.isArray(resultados)) {
  //       console.error("Error al obtener los resultados:", resultados);
  //       return {
  //         error: "No se han podido obtener los resultados correctamente.",
  //       };
  //     }

  //     // Preparar todos los trabajadores para procesamiento
  //     const trabajadoresParaProcesar = [];
  //     for (const resultado of resultados) {
  //       if ("trabajadores" in resultado && resultado.trabajadores) {
  //         for (const trabajador of resultado.trabajadores) {
  //           let tiendaId: number | null = null;
  //           if (trabajador.descripcionCentro) {
  //             const transformedDescripcion =
  //               trabajador.descripcionCentro.replace(/-/, "--");
  //             const foundTienda = tiendas.find(
  //               (tienda) =>
  //                 tienda.nombre.toLowerCase() ===
  //                 transformedDescripcion.toLowerCase(),
  //             );
  //             if (foundTienda) {
  //               tiendaId = foundTienda.id;
  //             }
  //           }

  //           trabajadoresParaProcesar.push({
  //             dni: trabajador.documento,
  //             nombreApellidos: trabajador.apellidosYNombre,
  //             displayName: trabajador.nombre,
  //             emails: trabajador.email,
  //             direccion: `${trabajador.viaPublica} ${trabajador.numero} ${trabajador.numero} ${trabajador.piso}`,
  //             llevaEquipo: false,
  //             tipoTrabajador: "DEPENDENTA",
  //             ciudad: trabajador.poblacion,
  //             telefonos: trabajador.noTelfMovilPersonal,
  //             codigoPostal: trabajador.cp,
  //             cuentaCorriente: "0",
  //             fechaNacimiento: null,
  //             nacionalidad: trabajador.codPaisNacionalidad,
  //             displayFoto: null,
  //             excedencia: false,
  //             idEmpresa: "a9357dca-f201-49b9-ae53-a7aba2f654c5",
  //             idResponsable: null,
  //             nSeguridadSocial: trabajador.noAfiliacion,
  //             idTienda: tiendaId,
  //             tokenQR: "",
  //             arrayRoles: ["b3f04be2-35f5-46d0-842b-5be49014a2ef"],
  //             contrato: {
  //               fechaAlta: trabajador.altaContrato
  //                 ? new Date(trabajador.altaContrato)
  //                 : new Date(),
  //               fechaAntiguedad: trabajador.antiguedadEmpresa
  //                 ? new Date(trabajador.antiguedadEmpresa)
  //                 : new Date(),
  //               horasContrato:
  //                 trabajador.horassemana && trabajador.horassemana > 0
  //                   ? Math.round((trabajador.horassemana * 100) / 40)
  //                   : 100,
  //               inicioContrato: trabajador.altaContrato
  //                 ? new Date(trabajador.altaContrato)
  //                 : new Date(),
  //               fechaBaja:
  //                 trabajador.bajaEmpresa &&
  //                 trabajador.bajaEmpresa.includes("0001-01-01")
  //                   ? null
  //                   : new Date(trabajador.bajaEmpresa),
  //               finalContrato:
  //                 trabajador.bajaEmpresa &&
  //                 trabajador.bajaEmpresa.includes("0001-01-01")
  //                   ? null
  //                   : new Date(trabajador.bajaEmpresa),
  //             },
  //           });
  //         }
  //       }
  //     }

  //     // Procesar por lotes
  //     const BATCH_SIZE = 50;
  //     const batches = [];
  //     for (let i = 0; i < trabajadoresParaProcesar.length; i += BATCH_SIZE) {
  //       batches.push(trabajadoresParaProcesar.slice(i, i + BATCH_SIZE));
  //     }

  //     let processedCount = 0;
  //     let errorCount = 0;

  //     // Procesar cada lote
  //     for (const batch of batches) {
  //       try {
  //         // Usar transacción para cada lote
  //         await this.prisma.$transaction(async (tx) => {
  //           for (const trabajador of batch) {
  //             try {
  //               await this.crearTrabajadorOmne(trabajador);
  //               processedCount++;
  //             } catch (error) {
  //               console.error(
  //                 `Error al procesar trabajador ${trabajador.dni}:`,
  //                 error,
  //               );
  //               errorCount++;
  //             }
  //           }
  //         });

  //         // Pequeña pausa entre lotes para evitar sobrecarga
  //         await new Promise((resolve) => setTimeout(resolve, 100));
  //       } catch (error) {
  //         console.error("Error en el procesamiento del lote:", error);
  //         errorCount += batch.length;
  //       }
  //     }

  //     // Actualizar fecha de sincronización
  //     const newSyncDate = DateTime.now().toJSDate();
  //     await this.parametrosService.updateParametros("sincro_trabajadores", {
  //       lastSyncWorkers: newSyncDate,
  //     });

  //     return {
  //       message: `Sincronización completada. Procesados: ${processedCount}, Errores: ${errorCount}`,
  //     };
  //   } catch (error) {
  //     console.error("Error en sincronizarTrabajadores:", error);
  //     return { error: `Error en la sincronización: ${error.message}` };
  //   } finally {
  //     // Asegurar que las conexiones se cierren
  //     await this.prisma.$disconnect();
  //   }
  // }

  // async guardarTrabajadoresOmne() {
  //   return await this.sincronizarTrabajadores();
  //   // return this.tiendaInstance.getTiendas();
  // }

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

  async borrarConFechaBaja() {
    try {
      return await this.prisma.trabajador.deleteMany({
        where: {
          contratos: {
            some: {
              fechaBaja: {
                not: null,
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
