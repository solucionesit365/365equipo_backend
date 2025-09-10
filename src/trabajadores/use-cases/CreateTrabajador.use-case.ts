import { Injectable } from "@nestjs/common";
import {
  ICreateTrabajadorUseCase,
  ICreateTrabajadorDto,
} from "./interfaces/ICreateTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";
import { ICreateContratoUseCase } from "../../contrato/use-cases/interfaces/ICreateContrato.use-case";

@Injectable()
export class CreateTrabajadorUseCase implements ICreateTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly createContratoUseCase: ICreateContratoUseCase,
  ) {}

  async execute(trabajadores: ICreateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresCreados: Trabajador[] = [];

    console.log(
      `=== INICIANDO CREACIÓN DE ${trabajadores.length} TRABAJADORES ===`,
    );

    for (const trabajador of trabajadores) {
      // Usar la misma lógica que en sincronización para buscar existencia
      let trabajadorExistente = null;

      // Primero verificar por nPerceptor + empresaId si nPerceptor existe
      if (trabajador.nPerceptor) {
        trabajadorExistente =
          await this.trabajadorRepository.readByPerceptorAndEmpresa(
            trabajador.nPerceptor,
            trabajador.empresaId,
          );
        if (trabajadorExistente) {
          console.log(
            `Trabajador ya existe por nPerceptor+empresa: ${trabajador.nPerceptor}-${trabajador.empresaId}, omitiendo`,
          );
          continue;
        }
      }

      // Si no se encontró y hay DNI válido, verificar por DNI
      if (trabajador.dni && trabajador.dni.trim() !== "") {
        trabajadorExistente = await this.trabajadorRepository.readByDni(
          trabajador.dni,
        );
        if (trabajadorExistente) {
          console.log(
            `Trabajador ya existe por DNI: ${trabajador.dni}, omitiendo`,
          );
          continue;
        }
      }

      // Si no existe, crear el trabajador
      const trabajadorCreado = await this.trabajadorRepository.create({
        nombreApellidos: trabajador.nombreApellidos,
        displayName: trabajador.displayName || trabajador.nombreApellidos,
        emails: trabajador.emails,
        dni: trabajador.dni,
        direccion: trabajador.direccion,
        ciudad: trabajador.ciudad,
        telefonos: trabajador.telefonos,
        fechaNacimiento: trabajador.fechaNacimiento,
        nacionalidad: trabajador.nacionalidad,
        nSeguridadSocial: trabajador.nSeguridadSocial,
        codigoPostal: trabajador.codigoPostal,
        tipoTrabajador: trabajador.tipoTrabajador,
        llevaEquipo: false,
        excedencia: false,
        empresa: {
          connect: {
            id: trabajador.empresaId,
          },
        },
        nPerceptor: trabajador.nPerceptor,
      });

      // Luego crear el contrato asociado
      await this.createContratoUseCase.execute({
        horasContrato: this.convertirHorasSemanalesAPorcentaje(
          trabajador.horasContrato,
        ), // Es un porcentaje
        inicioContrato: trabajador.inicioContrato,
        finalContrato: trabajador.finalContrato,
        fechaAlta: trabajador.fechaAlta,
        fechaAntiguedad: trabajador.fechaAntiguedad,
        fechaBaja: undefined,
        idTrabajador: trabajadorCreado.id,
      });

      trabajadoresCreados.push(trabajadorCreado);
    }

    return trabajadoresCreados;
  }

  private convertirHorasSemanalesAPorcentaje(horas: number) {
    const jornadaCompleta = 40; // Definir la jornada completa como 40 horas semanales
    if (horas >= jornadaCompleta) return 100;
    return Math.round((horas / jornadaCompleta) * 100);
  }
}
