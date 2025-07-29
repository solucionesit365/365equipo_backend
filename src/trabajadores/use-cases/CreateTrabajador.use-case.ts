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
    private readonly createContratoUseCase: ICreateContratoUseCase
  ) {}

  async execute(trabajadores: ICreateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresCreados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
      // Primero crear el trabajador
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
        horasContrato: trabajador.horasContrato,
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
}
