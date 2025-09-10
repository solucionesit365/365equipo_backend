import { Injectable } from "@nestjs/common";
import {
  IUpdateTrabajadorUseCase,
  IUpdateTrabajadorDto,
} from "./interfaces/IUpdateTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";
import { LoggerService } from "../../logger/logger.service";

@Injectable()
export class UpdateTrabajadorUseCase implements IUpdateTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async execute(trabajadores: IUpdateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresActualizados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
      const { id, ...datosActualizar } = trabajador;

      const trabajadorActualizado = await this.trabajadorRepository.updateOne(
        id,
        datosActualizar,
      );

      trabajadoresActualizados.push(trabajadorActualizado);

      //Logger de cada actualización
      await this.loggerService.create({
        action: "ACTUALIZACION DE TRABAJADOR DE OMNE A APP",
        name: "omne_to_app",
        extraData: {
          id,
          cambios: datosActualizar,
          resultado: trabajadorActualizado,
        },
      });
    }

    return trabajadoresActualizados;
  }

  async executeOne(trabajador: IUpdateTrabajadorDto): Promise<Trabajador> {
    const { id, ...datosActualizar } = trabajador;

    const trabajadorActualizado = await this.trabajadorRepository.updateOne(
      id,
      datosActualizar,
    );

    //Logger de cada actualización
    await this.loggerService.create({
      action: "ACTUALIZACION DE TRABAJADOR DE OMNE A APP",
      name: "omne_to_app",
      extraData: {
        id,
        cambios: datosActualizar,
        resultado: trabajadorActualizado,
      },
    });

    return trabajadorActualizado;
  }
}
