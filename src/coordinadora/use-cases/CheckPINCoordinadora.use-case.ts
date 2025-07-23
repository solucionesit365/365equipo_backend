import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ICoordinadoraRepository } from "../repository/interfaces/ICoordinadora.repository";
import { ICheckPINCoordinadoraUseCase } from "./interfaces/ICheckPINCoordinadora.use.case";

@Injectable()
export class CheckPINCoordinadoraUseCase
  implements ICheckPINCoordinadoraUseCase
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
  ) {}

  async execute(idTienda: number, pin: number): Promise<boolean> {
    // Obtener la coordinadora de la tienda
    // Comparar el PIN con el id de la coordinadora
    const coordinadora =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

    if (!coordinadora)
      throw new InternalServerErrorException("Coordinadora no encontrada");

    return coordinadora.id === pin;
  }
}
