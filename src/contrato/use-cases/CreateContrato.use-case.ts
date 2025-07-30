import { Injectable } from "@nestjs/common";
import { ICreateContratoUseCase, ICreateContratoUseCaseDto } from "./interfaces/ICreateContrato.use-case";
import { IContratoRepository } from "../repository/interfaces/IContrato.repository";
import { Contrato2 } from "@prisma/client";

@Injectable()
export class CreateContratoUseCase implements ICreateContratoUseCase {
  constructor(
    private readonly contratoRepository: IContratoRepository
  ) {}

  async execute(contrato: ICreateContratoUseCaseDto): Promise<Contrato2> {
    // Verificar si hay un contrato activo y cerrarlo si existe
    const contratoActivo = await this.contratoRepository.findActiveByTrabajadorId(contrato.idTrabajador);
    
    if (contratoActivo) {
      await this.contratoRepository.update(contratoActivo.id, {
        fechaBaja: new Date(),
        finalContrato: new Date()
      });
    }

    // Crear el nuevo contrato
    return await this.contratoRepository.create(contrato);
  }
}