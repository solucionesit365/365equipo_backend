import { Injectable } from "@nestjs/common";
import {
  ICreateTrabajadorUseCase,
  ICreateTrabajadorDto,
} from "./interfaces/ICreateTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";

@Injectable()
export class CreateTrabajadorUseCase implements ICreateTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(trabajadores: ICreateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresCreados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
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

      trabajadoresCreados.push(trabajadorCreado);
    }

    return trabajadoresCreados;
  }
}
