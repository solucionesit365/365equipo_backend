import { Injectable } from "@nestjs/common";
import {
  IDeleteTrabajadorUseCase,
  IDeleteTrabajadorDto,
} from "./interfaces/IDeleteTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { LoggerService } from "../../logger/logger.service";

@Injectable()
export class DeleteTrabajadorUseCase implements IDeleteTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async execute(
    trabajadores: IDeleteTrabajadorDto[],
  ): Promise<{ count: number }> {
    let count = 0;

    for (const trabajador of trabajadores) {
      try {
        await this.trabajadorRepository.deleteOne(trabajador.id);
        count++;
      } catch (error) {
        console.error(
          `Error eliminando trabajador ID ${trabajador.id}:`,
          error.message,
        );
        throw error;
      }
    }
    //Logger de deletes
    await this.loggerService.create({
      action: "ELIMINACIONES DE TRABAJADORES DE OMNE A APP",
      name: "omne_to_app",
      extraData: { count },
    });

    return { count };
  }
}
