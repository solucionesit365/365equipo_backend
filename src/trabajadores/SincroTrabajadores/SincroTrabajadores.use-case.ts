import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ISincroTrabajadoresUseCase } from "./ISincroTrabajadores.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { AxiosBcService } from "../../axios/axios-bc.service";
import { EmpresaService } from "../../empresa/empresa.service";
import { Empresa } from "@prisma/client";
import { DateTime } from "luxon";

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
    // 2. Obtener trabajadores de nuestra BBDD
    // 3. Buscar trabajadores a modificar, trabajadores a eliminar y trabajadores a crear.
    const empresas = await this.empresaService.getEmpresas(true);
    const trabajadoresOmne = await this.getTrabajadoresOmne(empresas);

    return {
      trabajadoresOmne,
      created: 0,
      deleted: 0,
      updated: 0,
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
            
            if (!trabajadorExistente || 
                DateTime.fromISO(trabajador.systemModifiedAt) > 
                DateTime.fromISO(trabajadorExistente.systemModifiedAt)) {
              trabajadoresMap.set(clave, trabajador);
            }
          });
          
          const trabajadores = Array.from(trabajadoresMap.values()).map((trabajador) => {
            const trabajadorRelacionado =
              responseFechaNacimiento.data.value.find(
                (extraData) => extraData.noPerceptor === trabajador.noPerceptor,
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
      console.log(error.message);
      throw new InternalServerErrorException();
    }
  }
}
