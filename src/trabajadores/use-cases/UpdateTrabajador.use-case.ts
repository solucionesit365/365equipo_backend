import { Injectable } from "@nestjs/common";
import {
  IUpdateTrabajadorUseCase,
  IUpdateTrabajadorDto,
} from "./interfaces/IUpdateTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";

@Injectable()
export class UpdateTrabajadorUseCase implements IUpdateTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(trabajadores: IUpdateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresActualizados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
      const { id, ...datosActualizar } = trabajador;

      const trabajadorActualizado = await this.trabajadorRepository.updateOne(
        id,
        datosActualizar,
      );

      trabajadoresActualizados.push(trabajadorActualizado);
    }

    return trabajadoresActualizados;
  }
}
