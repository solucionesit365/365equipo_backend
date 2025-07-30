import { Injectable } from "@nestjs/common";
import {
  IDeleteTrabajadorUseCase,
  IDeleteTrabajadorDto,
} from "./interfaces/IDeleteTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";

@Injectable()
export class DeleteTrabajadorUseCase implements IDeleteTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(
    trabajadores: IDeleteTrabajadorDto[],
  ): Promise<{ count: number }> {
    let count = 0;
    
    for (const trabajador of trabajadores) {
      try {
        await this.trabajadorRepository.deleteOne(trabajador.id);
        count++;
      } catch (error) {
        console.error(`Error eliminando trabajador ID ${trabajador.id}:`, error.message);
        throw error;
      }
    }

    return { count };
  }
}
