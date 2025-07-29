import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ISincroTrabajadoresUseCase } from "./ISincroTrabajadores.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { AxiosBcService } from "../../axios/axios-bc.service";
import { EmpresaService } from "../../empresa/empresa.service";
import { Empresa } from "@prisma/client";
import { DateTime } from "luxon";


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
  ) {}

  async execute() {
    // 0. Obtener empresas HECHO
    // 1. Obtener trabajadores de omne HECHO
    // 2. Obtener trabajadores de nuestra BBDD HECHO
    // 3. Buscar trabajadores a modificar, trabajadores a eliminar y trabajadores a crear.
    const empresas = await this.empresaService.getEmpresas(true);
    const trabajadoresOmne = await this.getTrabajadoresOmne(empresas);
    const trabajadoresApp = await this.trabajadoresRepository.readAll();

    // Campos importantes para detectar cambios
    const camposImportantes = [
      "apellidosYNombre",
      "nombre",
      "email",
      "documento",
      "noTelfMovilPersonal",
      "noAfiliacion",
      "antiguedadEmpresa",
      "altaContrato",
      "bajaEmpresa",
      "horassemana",
      "fechaNacimiento",
    ];

    // Aplanar todos los trabajadores de Omne en un solo array
    const todosLosTrabajadoresOmne = trabajadoresOmne
      .filter((empresa) => empresa.trabajadores)
      .flatMap((empresa) => empresa.trabajadores);

    // Crear mapas para búsqueda eficiente
    const trabajadoresOmneMap = new Map();
    todosLosTrabajadoresOmne.forEach((t) => {
      trabajadoresOmneMap.set(`${t.noPerceptor}-${t.empresaID}`, t);
    });

    const trabajadoresAppMap = new Map();
    trabajadoresApp.forEach((t) => {
      trabajadoresAppMap.set(`${t.nPerceptor}-${t.empresaId}`, t);
    });

    // Clasificar trabajadores
    const trabajadoresACrear = [];
    const trabajadoresAModificar = [];
    const trabajadoresAEliminar = [];

    // Buscar trabajadores a crear o modificar
    todosLosTrabajadoresOmne.forEach((trabajadorOmne) => {
      const clave = `${trabajadorOmne.noPerceptor}-${trabajadorOmne.empresaID}`;
      const trabajadorApp = trabajadoresAppMap.get(clave);

      if (!trabajadorApp) {
        // No existe en la app, hay que crearlo solo si no tiene fecha de baja
        if (!trabajadorOmne.bajaEmpresa) {
          trabajadoresACrear.push(trabajadorOmne);
        }
      } else {
        // Existe en ambos
        if (trabajadorOmne.bajaEmpresa) {
          // Si tiene fecha de baja en Omne, hay que eliminarlo de la app
          trabajadoresAEliminar.push(trabajadorApp);
        } else {
          // No tiene fecha de baja, verificar si hay cambios importantes
          const hayChangios = camposImportantes.some((campo) => {
            const valorOmne = trabajadorOmne[campo];
            const valorApp = trabajadorApp[campo];

            // Comparación especial para fechas
            if (valorOmne instanceof DateTime || valorApp instanceof Date) {
              const fechaOmne =
                valorOmne instanceof DateTime ? valorOmne.toJSDate() : valorOmne;
              const fechaApp =
                valorApp instanceof Date ? valorApp : new Date(valorApp);
              return fechaOmne?.getTime() !== fechaApp?.getTime();
            }

            return valorOmne !== valorApp;
          });

          if (hayChangios) {
            trabajadoresAModificar.push({
              ...trabajadorOmne,
              id: trabajadorApp.id, // Mantener el ID del registro existente
            });
          }
        }
      }
    });

    // Buscar trabajadores a eliminar (están en la app pero no en Omne)
    trabajadoresApp.forEach((trabajadorApp) => {
      const clave = `${trabajadorApp.nPerceptor}-${trabajadorApp.empresaId}`;
      if (!trabajadoresOmneMap.has(clave)) {
        trabajadoresAEliminar.push(trabajadorApp);
      }
    });

    return {
      created: trabajadoresACrear.length,
      deleted: trabajadoresAEliminar.length,
      updated: trabajadoresAModificar.length,
      trabajadoresOmne,
      trabajadoresACrear,
      trabajadoresAModificar,
      trabajadoresAEliminar,
    };
  }

  private async getTrabajadoresOmne(empresas: Empresa[]) {
    try {
      // Ejecutar las consultas en paralelo para cada empresa
      const resultados = await Promise.all(
        empresas.map(async ({ id: empresaID, nombre }) => {
          const response = await this.axiosBCService
            .getAxios()
            .get(
              `Production/api/Miguel/365ObradorAPI/v1.0/companies(${empresaID})/perceptoresQuery`,
            );

          const responseFechaNacimiento = await this.axiosBCService
            .getAxios()
            .get(
              `Production/api/eze/365ObradorAPI/v1.0/companies(${empresaID})/PerceptorsExtraData`,
            );

          const trabajadoresMap = new Map();

          response.data.value.forEach((trabajador) => {
            const clave = `${trabajador.noPerceptor}-${empresaID}`;
            const trabajadorExistente = trabajadoresMap.get(clave);

            if (
              !trabajadorExistente ||
              DateTime.fromISO(trabajador.systemModifiedAt) >
                DateTime.fromISO(trabajadorExistente.systemModifiedAt)
            ) {
              trabajadoresMap.set(clave, trabajador);
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
}
