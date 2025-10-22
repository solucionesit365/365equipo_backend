import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ISincroTrabajadoresUseCase } from "./interfaces/ISincroTrabajadores.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { AxiosBcService } from "../../axios/axios-bc.service";
import { EmpresaService } from "../../empresa/empresa.service";
import { Empresa, Trabajador } from "@prisma/client";
import { DateTime } from "luxon";
import { ICreateTrabajadorUseCase } from "./interfaces/ICreateTrabajador.use-case";
import { IUpdateTrabajadorUseCase } from "./interfaces/IUpdateTrabajador.use-case";
import { IDeleteTrabajadorUseCase } from "./interfaces/IDeleteTrabajador.use-case";
import { IContratoRepository } from "../../contrato/repository/interfaces/IContrato.repository";

// Interfaces para el response de trabajadoresOMNEQuery
interface TrabajadorOMNE {
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
  fechaInicio?: string;
  fechaFinalizacion?: string;
  horassemana: number;
  descripcionCentro: string;
  auxiliaryIndex1: string;
  auxiliaryIndex2: number;
  auxiliaryIndex3: string;
  auxiliaryIndex4: string;
}

interface TrabajadoresOMNEResponse {
  "@odata.context": string;
  value: TrabajadorOMNE[];
}

interface PerceptorExtraData {
  noPerceptor: string;
  fechaNacimiento?: string;
}

interface PerceptorsExtraDataResponse {
  "@odata.context": string;
  value: PerceptorExtraData[];
}

// ejemplo de trabajador que viene de omne:
//                     "noPerceptor": "2290",
//                     "apellidosYNombre": "COSME FULANITO PEREZ",
//                     "nombre": "COSME FULANITO",
//                     "email": "soycosme@icloud.com",
//                     "documento": "41033750X",
//                     "viaPublica": "TRES CREUS",
//                     "numero": "14",
//                     "piso": "2",
//                     "poblacion": "Sabadell",
//                     "noTelfMovilPersonal": "658974561",
//                     "nacionalidad": 0,
//                     "codPaisNacionalidad": "ES",
//                     "noAfiliacion": "081505170434",
//                     "cp": "08020",
//                     "centroTrabajo": "001",
//                     "antiguedadEmpresa": "2021-10-25T00:00:00.000+01:00",
//                     "altaContrato": "2024-03-04T00:00:00.000+01:00",
//                     "bajaEmpresa": "2025-03-31T00:00:00.000+02:00",
//                     "cambioAntiguedad": null,
//                     "categoria": "OF1E",
//                     "fechaCalculoAntiguedad": null,
//                     "tipoContrato": "189",
//                     "systemModifiedAt": "2025-04-30T16:41:17.893Z",
//                     "systemCreatedAt": "2024-11-29T00:15:04.79Z",
//                     "horassemana": 40,
//                     "descripcionCentro": "T--216",
//                     "auxiliaryIndex1": "2290",
//                     "auxiliaryIndex2": 10000,
//                     "auxiliaryIndex3": "GIRONA",
//                     "auxiliaryIndex4": "001",
//                     "empresaID": "d2a97ec2-654e-ef11-bfe4-7c1e5234e806",
//                     "fechaNacimiento": "1999-06-18T00:00:00.000+02:00"

@Injectable()
export class SincroTrabajadoresUseCase implements ISincroTrabajadoresUseCase {
  constructor(
    private readonly trabajadoresRepository: ITrabajadorRepository,
    private readonly axiosBCService: AxiosBcService,
    private readonly empresaService: EmpresaService, //Migrar empresa service al nuevo formato hexagonal
    private readonly createTrabajadorUseCase: ICreateTrabajadorUseCase,
    private readonly updateTrabajadorUseCase: IUpdateTrabajadorUseCase,
    private readonly deleteTrabajadorUseCase: IDeleteTrabajadorUseCase,
    private readonly contratoRepository: IContratoRepository,
  ) {}

  async execute() {
    // 0. Obtener empresas HECHO
    // 1. Obtener trabajadores de omne HECHO
    // 2. Obtener trabajadores de nuestra BBDD HECHO
    // 3. Buscar trabajadores a modificar, trabajadores a eliminar y trabajadores a crear.
    const empresas = await this.empresaService.getEmpresas(true);
    const trabajadoresOmne = await this.getTrabajadoresOmne(empresas);
    const trabajadoresApp = await this.trabajadoresRepository.readAll({
      sonPersonas: true,
    });

    // Obtener todos los contratos de los trabajadores en lotes para evitar saturar la base de datos
    const contratosMap = new Map();
    const BATCH_SIZE = 10; // Procesar 10 trabajadores a la vez

    for (let i = 0; i < trabajadoresApp.length; i += BATCH_SIZE) {
      const batch = trabajadoresApp.slice(i, i + BATCH_SIZE);
      const contratosPromises = batch.map(async (trabajador) => {
        const contratos = await this.contratoRepository.findByTrabajadorId(
          trabajador.id,
        );
        return { trabajadorId: trabajador.id, contratos };
      });

      const contratosData = await Promise.all(contratosPromises);
      contratosData.forEach(({ trabajadorId, contratos }) => {
        if (contratos.length > 0) {
          contratosMap.set(trabajadorId, contratos[0]); // Último contrato
        }
      });
    }

    // Mapeo de campos entre Omne y la base de datos
    const mapeosCampos = {
      apellidosYNombre: "nombreApellidos",
      nombre: "displayName",
      email: "emails",
      documento: "dni",
      noTelfMovilPersonal: "telefonos",
      noAfiliacion: "nSeguridadSocial",
      fechaNacimiento: "fechaNacimiento",
      noPerceptor: "nPerceptor",
      empresaID: "empresaId",
    };

    // Campos importantes para detectar cambios (solo datos personales, no del contrato)
    const camposImportantes = [
      { omne: "apellidosYNombre", app: "nombreApellidos" },
      { omne: "nombre", app: "displayName" },
      { omne: "email", app: "emails" },
      { omne: "documento", app: "dni" },
      { omne: "noTelfMovilPersonal", app: "telefonos" },
      { omne: "noAfiliacion", app: "nSeguridadSocial" },
      { omne: "fechaNacimiento", app: "fechaNacimiento" },
    ];

    // Aplanar todos los trabajadores de Omne en un solo array
    const todosLosTrabajadoresOmneRaw = trabajadoresOmne
      .filter((empresa) => empresa.trabajadores)
      .flatMap((empresa) => empresa.trabajadores);

    // Separar trabajadores con nPerceptor numérico vs alfanumérico
    const todosLosTrabajadoresOmne = [];
    const trabajadoresIgnorados = [];

    todosLosTrabajadoresOmneRaw.forEach((trabajador) => {
      if (trabajador.noPerceptor && !isNaN(parseInt(trabajador.noPerceptor))) {
        // nPerceptor es numérico, se puede procesar
        trabajador.noPerceptor = parseInt(trabajador.noPerceptor);
        todosLosTrabajadoresOmne.push(trabajador);
      } else {
        // nPerceptor es alfanumérico o vacío, se ignora
        trabajadoresIgnorados.push({
          ...trabajador,
          razonIgnorado: trabajador.noPerceptor
            ? `nPerceptor alfanumérico: ${trabajador.noPerceptor}`
            : "nPerceptor faltante",
        });
      }
    });

    // Crear mapas para búsqueda eficiente
    const trabajadoresOmneMap = new Map();
    const trabajadoresOmneDniMap = new Map(); // Mapa por DNI que puede tener múltiples valores

    todosLosTrabajadoresOmne.forEach((t) => {
      // Si tiene noPerceptor (ya validado como numérico), usar la clave compuesta
      if (t.noPerceptor) {
        const clave = `${t.noPerceptor}-${t.empresaID}`;
        trabajadoresOmneMap.set(clave, t);
      }
      // Mapear por DNI para búsqueda alternativa - puede haber múltiples trabajadores con el mismo DNI
      if (t.documento && t.documento.trim() !== "") {
        const existingWorkers = trabajadoresOmneDniMap.get(t.documento) || [];
        existingWorkers.push(t);
        trabajadoresOmneDniMap.set(t.documento, existingWorkers);
      }
    });

    const trabajadoresAppMap = new Map();
    const trabajadoresAppDniMap = new Map(); // Mapa por DNI que puede tener múltiples valores

    trabajadoresApp.forEach((t) => {
      // Si tiene nPerceptor, usar la clave compuesta
      if (t.nPerceptor) {
        const clave = `${String(t.nPerceptor)}-${t.empresaId}`;
        trabajadoresAppMap.set(clave, t);
      }
      // Mapear por DNI - puede haber múltiples trabajadores con el mismo DNI
      if (t.dni && t.dni.trim() !== "") {
        const existingWorkers = trabajadoresAppDniMap.get(t.dni) || [];
        existingWorkers.push(t);
        trabajadoresAppDniMap.set(t.dni, existingWorkers);
      }
    });

    // Clasificar trabajadores
    const trabajadoresACrear = [];
    const trabajadoresAModificar = [];
    const trabajadoresAEliminar = [];

    // Función helper para buscar trabajador en la App basado en datos de OMNE
    const buscarTrabajadorApp = (trabajadorOmne) => {
      // Buscar primero por nPerceptor + empresaId (clave única)
      if (trabajadorOmne.noPerceptor) {
        const clave = `${trabajadorOmne.noPerceptor}-${trabajadorOmne.empresaID}`;
        const encontrado = trabajadoresAppMap.get(clave);
        if (encontrado) return encontrado;
      }

      // Si no se encontró por clave única, buscar por DNI pero SOLO en la misma empresa
      // Esto es importante para trabajadores que pueden estar en múltiples empresas
      if (trabajadorOmne.documento && trabajadorOmne.documento.trim() !== "") {
        const trabajadoresPorDni =
          trabajadoresAppDniMap.get(trabajadorOmne.documento) || [];
        const trabajadorEnMismaEmpresa = trabajadoresPorDni.find(
          (t) => t.empresaId === trabajadorOmne.empresaID,
        );
        if (trabajadorEnMismaEmpresa) {
          return trabajadorEnMismaEmpresa;
        }
      }

      return null;
    };

    // 1. Procesar trabajadores de OMNE: decidir si crear, modificar o eliminar
    todosLosTrabajadoresOmne.forEach((trabajadorOmne) => {
      const trabajadorApp = buscarTrabajadorApp(trabajadorOmne);

      if (!trabajadorApp) {
        // No existe en la app, crear solo si tiene contrato activo (fechaFinalizacion es null o está en el futuro)
        const contratoActivo = !trabajadorOmne.fechaFinalizacion ||
          (trabajadorOmne.fechaFinalizacion && DateTime.now() < trabajadorOmne.fechaFinalizacion);

        if (contratoActivo && !trabajadorOmne.bajaEmpresa) {
          trabajadoresACrear.push(trabajadorOmne);
        }
      } else {
        // Existe en ambos sistemas
        // Verificar si tiene contrato activo (fechaFinalizacion es null o está en el futuro)
        const contratoActivo = !trabajadorOmne.fechaFinalizacion ||
          (trabajadorOmne.fechaFinalizacion && DateTime.now() < trabajadorOmne.fechaFinalizacion);

        if (!contratoActivo || trabajadorOmne.bajaEmpresa) {
          // El contrato ha terminado en esta empresa
          // Verificar si tiene contratos activos en otras empresas antes de eliminar
          const tieneContratosEnOtrasEmpresas = todosLosTrabajadoresOmne.some((t) => {
            // Mismo DNI pero diferente empresa o diferente nPerceptor
            const esMismaPersona = t.documento === trabajadorOmne.documento;
            const esDiferenteEmpresa = t.empresaID !== trabajadorOmne.empresaID;
            const tieneContratoActivo = !t.fechaFinalizacion ||
              (t.fechaFinalizacion && DateTime.now() < t.fechaFinalizacion);

            return esMismaPersona && esDiferenteEmpresa && tieneContratoActivo;
          });

          if (!tieneContratosEnOtrasEmpresas) {
            // No tiene contratos activos en ninguna empresa, marcar para eliminar
            trabajadoresAEliminar.push({
              ...trabajadorApp,
              razonEliminacion: trabajadorOmne.fechaFinalizacion
                ? `Contrato finalizado el ${trabajadorOmne.fechaFinalizacion}`
                : `Fecha de baja en OMNE: ${trabajadorOmne.bajaEmpresa}`,
            });
          }
        } else {
          // No tiene fecha de baja, verificar si hay cambios importantes en datos personales
          const hayChangiosDatosPersonales = camposImportantes.some((campo) => {
            const valorOmne = trabajadorOmne[campo.omne];
            const valorApp = trabajadorApp[campo.app];

            // Comparación especial para fechas
            if (valorOmne instanceof DateTime || valorApp instanceof Date) {
              const fechaOmne =
                valorOmne instanceof DateTime
                  ? valorOmne.toJSDate()
                  : valorOmne;
              const fechaApp =
                valorApp instanceof Date ? valorApp : new Date(valorApp);
              return fechaOmne?.getTime() !== fechaApp?.getTime();
            }

            // Comparación de strings con trim y toLowerCase para evitar falsos positivos
            if (typeof valorOmne === "string" && typeof valorApp === "string") {
              return (
                valorOmne?.trim().toLowerCase() !==
                valorApp?.trim().toLowerCase()
              );
            }

            return valorOmne !== valorApp;
          });

          // Verificar cambios en las horas de contrato
          let hayChangiosContrato = false;
          const contratoActual = contratosMap.get(trabajadorApp.id);
          if (contratoActual && trabajadorOmne.horassemana !== undefined) {
            const horasOmnePorcentaje = this.convertirHorasSemanalesAPorcentaje(
              trabajadorOmne.horassemana,
            );
            const horasAppPorcentaje = contratoActual.horasContrato || 0;
            // Tolerancia de 0.01 para evitar falsos positivos por redondeo
            hayChangiosContrato =
              Math.abs(horasOmnePorcentaje - horasAppPorcentaje) > 0.01;
          }

          if (hayChangiosDatosPersonales || hayChangiosContrato) {
            trabajadoresAModificar.push({
              ...trabajadorOmne,
              id: trabajadorApp.id, // Mantener el ID del registro existente
            });
          }
        }
      }
    });

    // 2. Buscar trabajadores que están en la App pero no en OMNE (para eliminar)
    trabajadoresApp.forEach((trabajadorApp) => {
      let encontradoEnOmne = false;

      // Buscar por nPerceptor + empresaId (clave única)
      if (trabajadorApp.nPerceptor) {
        const clave = `${String(trabajadorApp.nPerceptor)}-${
          trabajadorApp.empresaId
        }`;
        encontradoEnOmne = trabajadoresOmneMap.has(clave);
      }

      // Si no se encontró por clave única, buscar por DNI en la misma empresa
      if (
        !encontradoEnOmne &&
        trabajadorApp.dni &&
        trabajadorApp.dni.trim() !== ""
      ) {
        const trabajadoresOmnePorDni =
          trabajadoresOmneDniMap.get(trabajadorApp.dni) || [];
        const trabajadorOmneEnMismaEmpresa = trabajadoresOmnePorDni.find(
          (t) => t.empresaID === trabajadorApp.empresaId,
        );
        encontradoEnOmne = !!trabajadorOmneEnMismaEmpresa;
      }

      if (!encontradoEnOmne) {
        // No encontrado en OMNE en esta empresa
        // Verificar si el trabajador (por DNI) existe en otras empresas con contrato activo
        if (trabajadorApp.dni && trabajadorApp.dni.trim() !== "") {
          const tieneContratosEnOtrasEmpresas = todosLosTrabajadoresOmne.some((t) => {
            const esMismaPersona = t.documento === trabajadorApp.dni;
            const tieneContratoActivo = !t.fechaFinalizacion ||
              (t.fechaFinalizacion && DateTime.now() < t.fechaFinalizacion);

            return esMismaPersona && tieneContratoActivo;
          });

          if (!tieneContratosEnOtrasEmpresas) {
            // No tiene contratos activos en ninguna empresa, eliminar
            trabajadoresAEliminar.push({
              ...trabajadorApp,
              razonEliminacion: `No encontrado en OMNE o sin contratos activos`,
            });
          }
        } else {
          // No tiene DNI, eliminar directamente
          trabajadoresAEliminar.push({
            ...trabajadorApp,
            razonEliminacion: `No encontrado en OMNE`,
          });
        }
      }
    });

    // Ejecutar las operaciones de base de datos
    let trabajadoresCreados = [];
    let trabajadoresActualizados = [];
    let trabajadoresEliminadosResult = { count: 0 };
    let trabajadoresEliminadosArray = [];

    try {
      // 1. Actualizar trabajadores existentes
      if (trabajadoresAModificar.length > 0) {
        const trabajadoresParaActualizar = trabajadoresAModificar.map((t) => ({
          id: t.id,
          nombreApellidos: t.apellidosYNombre,
          displayName: t.nombre,
          emails: t.email,
          dni: t.documento,
          direccion: `${t.viaPublica} ${t.numero}${
            t.piso ? ` ${t.piso}` : ""
          }`.trim(),
          ciudad: t.poblacion,
          telefonos: t.noTelfMovilPersonal,
          fechaNacimiento: t.fechaNacimiento?.toJSDate() || undefined,
          nacionalidad: t.codPaisNacionalidad,
          nSeguridadSocial: t.noAfiliacion,
          codigoPostal: t.cp,
          horasContrato: t.horassemana || 40,
          inicioContrato: t.fechaInicio?.toJSDate() || t.altaContrato?.toJSDate() || new Date(),
          finalContrato: t.fechaFinalizacion?.toJSDate() || t.bajaEmpresa?.toJSDate() || undefined,
          fechaAlta: t.altaContrato?.toJSDate() || new Date(),
          fechaAntiguedad:
            t.antiguedadEmpresa?.toJSDate() ||
            t.altaContrato?.toJSDate() ||
            new Date(),
        }));

        trabajadoresActualizados = await this.updateTrabajadorUseCase.execute(
          trabajadoresParaActualizar,
        );
      }

      // 2. Eliminar trabajadores.
      if (trabajadoresAEliminar.length > 0) {
        const trabajadoresParaEliminar = trabajadoresAEliminar.map((t) => ({
          id: t.id,
        }));

        trabajadoresEliminadosResult =
          await this.deleteTrabajadorUseCase.execute(trabajadoresParaEliminar);
        trabajadoresEliminadosArray = trabajadoresAEliminar; // Guardar los trabajadores eliminados con su info completa
      }

      // 3. Crear trabajadores nuevos
      if (trabajadoresACrear.length > 0) {
        const trabajadoresParaCrear = trabajadoresACrear.map((t) => ({
          nombreApellidos: t.apellidosYNombre,
          displayName: t.nombre,
          emails: t.email,
          dni: t.documento,
          direccion: `${t.viaPublica} ${t.numero}${
            t.piso ? ` ${t.piso}` : ""
          }`.trim(),
          ciudad: t.poblacion,
          telefonos: t.noTelfMovilPersonal,
          fechaNacimiento: t.fechaNacimiento?.toJSDate() || undefined,
          nacionalidad: t.codPaisNacionalidad,
          nSeguridadSocial: t.noAfiliacion,
          codigoPostal: t.cp,
          tipoTrabajador: "NORMAL", // Ajustar según tu lógica de negocio
          empresaId: t.empresaID,
          nPerceptor: t.noPerceptor,
          // Datos del contrato
          horasContrato: t.horassemana || 40,
          inicioContrato: t.fechaInicio?.toJSDate() || t.altaContrato?.toJSDate() || new Date(),
          finalContrato: t.fechaFinalizacion?.toJSDate() || t.bajaEmpresa?.toJSDate() || undefined,
          fechaAlta: t.altaContrato?.toJSDate() || new Date(),
          fechaAntiguedad:
            t.antiguedadEmpresa?.toJSDate() ||
            t.altaContrato?.toJSDate() ||
            new Date(),
        }));

        trabajadoresCreados = await this.createTrabajadorUseCase.execute(
          trabajadoresParaCrear,
        );
      }
    } catch (error) {
      console.error("Error al sincronizar trabajadores:", error);
      throw new InternalServerErrorException(
        "Error al sincronizar trabajadores con la base de datos",
      );
    }

    return {
      created: trabajadoresCreados.length,
      deleted: trabajadoresEliminadosResult.count,
      updated: trabajadoresActualizados.length,
      ignored: trabajadoresIgnorados.length,
      trabajadoresCreados,
      trabajadoresActualizados,
      trabajadoresEliminados: trabajadoresEliminadosArray,
      trabajadoresIgnorados: trabajadoresIgnorados.slice(0, 10), // Limitar a 10 para no sobrecargar la respuesta
    };
  }

  private async getTrabajadoresOmne(empresas: Empresa[]) {
    try {
      // Ejecutar las consultas en paralelo para cada empresa
      const resultados = await Promise.all(
        empresas.map(async ({ id: empresaID, nombre }) => {
          const response = await this.axiosBCService
            .getAxios()
            .get<TrabajadoresOMNEResponse>(
              `Production/api/Ezequiel/TrabajadoresAPI/v1.0/companies(${empresaID})/trabajadoresOMNEQuery`,
            );

          const responseFechaNacimiento = await this.axiosBCService
            .getAxios()
            .get<PerceptorsExtraDataResponse>(
              `Production/api/eze/365ObradorAPI/v1.0/companies(${empresaID})/PerceptorsExtraData`,
            );

          const trabajadoresMap = new Map();

          response.data.value.forEach((trabajador) => {
            const clave = `${trabajador.noPerceptor}-${empresaID}`;
            const trabajadorExistente = trabajadoresMap.get(clave);

            // Seleccionar el contrato con fechaInicio más reciente
            if (!trabajadorExistente) {
              trabajadoresMap.set(clave, trabajador);
            } else {
              const fechaInicioActual = trabajador.fechaInicio && trabajador.fechaInicio !== "0001-01-01"
                ? DateTime.fromFormat(trabajador.fechaInicio, "yyyy-MM-dd")
                : null;
              const fechaInicioExistente = trabajadorExistente.fechaInicio && trabajadorExistente.fechaInicio !== "0001-01-01"
                ? DateTime.fromFormat(trabajadorExistente.fechaInicio, "yyyy-MM-dd")
                : null;

              // Si el actual tiene fechaInicio y es más reciente, reemplazar
              if (fechaInicioActual && (!fechaInicioExistente || fechaInicioActual > fechaInicioExistente)) {
                trabajadoresMap.set(clave, trabajador);
              }
            }
          });

          const trabajadores = Array.from(trabajadoresMap.values()).map(
            (trabajador) => {
              const trabajadorRelacionado =
                responseFechaNacimiento.data.value.find(
                  (extraData) =>
                    extraData.noPerceptor === trabajador.noPerceptor,
                );

              let fechaNacimiento = null;

              trabajador.empresaID = empresaID;

              if (trabajador.antiguedadEmpresa) {
                trabajador.antiguedadEmpresa =
                  trabajador.antiguedadEmpresa != "0001-01-01"
                    ? DateTime.fromFormat(
                        trabajador.antiguedadEmpresa,
                        "yyyy-MM-dd",
                      )
                    : null;
              }
              if (trabajador.altaContrato) {
                trabajador.altaContrato =
                  trabajador.altaContrato != "0001-01-01"
                    ? DateTime.fromFormat(trabajador.altaContrato, "yyyy-MM-dd")
                    : null;
              }
              if (trabajador.bajaEmpresa) {
                trabajador.bajaEmpresa =
                  trabajador.bajaEmpresa != "0001-01-01"
                    ? DateTime.fromFormat(trabajador.bajaEmpresa, "yyyy-MM-dd")
                    : null;
              }
              if (trabajador.cambioAntiguedad) {
                trabajador.cambioAntiguedad =
                  trabajador.cambioAntiguedad != "0001-01-01"
                    ? DateTime.fromFormat(
                        trabajador.cambioAntiguedad,
                        "yyyy-MM-dd",
                      )
                    : null;
              }
              if (trabajador.fechaCalculoAntiguedad) {
                trabajador.fechaCalculoAntiguedad =
                  trabajador.fechaCalculoAntiguedad != "0001-01-01"
                    ? DateTime.fromFormat(
                        trabajador.fechaCalculoAntiguedad,
                        "yyyy-MM-dd",
                      )
                    : null;
              }
              if (trabajador.fechaNacimiento) {
                trabajador.fechaNacimiento =
                  trabajador.fechaNacimiento != "0001-01-01"
                    ? DateTime.fromFormat(
                        trabajador.fechaNacimiento,
                        "yyyy-MM-dd",
                      )
                    : null;
              }
              if (trabajador.fechaInicio) {
                trabajador.fechaInicio =
                  trabajador.fechaInicio != "0001-01-01"
                    ? DateTime.fromFormat(trabajador.fechaInicio, "yyyy-MM-dd")
                    : null;
              }
              if (trabajador.fechaFinalizacion) {
                trabajador.fechaFinalizacion =
                  trabajador.fechaFinalizacion != "0001-01-01"
                    ? DateTime.fromFormat(
                        trabajador.fechaFinalizacion,
                        "yyyy-MM-dd",
                      )
                    : null;
              }

              if (trabajadorRelacionado?.fechaNacimiento) {
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
            },
          );
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
      console.log(error.message);
      throw new InternalServerErrorException();
    }
  }

  private convertirHorasSemanalesAPorcentaje(horas: number) {
    const jornadaCompleta = 40; // Definir la jornada completa como 40 horas semanales
    if (horas >= jornadaCompleta) return 100;
    return Math.round((horas / jornadaCompleta) * 100);
  }
}
