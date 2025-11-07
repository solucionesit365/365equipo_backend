import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ICoordinadoraRepository } from "../repository/interfaces/ICoordinadora.repository";
import { ICheckPINCoordinadoraUseCase } from "./interfaces/ICheckPINCoordinadora.use.case";

@Injectable()
export class CheckPINCoordinadoraUseCase
  implements ICheckPINCoordinadoraUseCase
{
  private lastCoordinadora: { uid: string; idSql: number } | null = null;
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
  ) {}

  // async execute(idTienda: number, pin: number): Promise<boolean> {
  //   // Obtener la coordinadora de la tienda
  //   // Comparar el PIN con el id de la coordinadora
  //   const coordinadora =
  //     await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

  //   if (!coordinadora)
  //     throw new InternalServerErrorException("Coordinadora no encontrada");

  //   return coordinadora.id === pin;
  // }

  // async execute(idTienda: number, pin: number): Promise<boolean> {
  //   // Obtener la coordinadora de la tienda
  //   // Comparar el PIN con el id de la coordinadora
  //   const coordinadora =
  //     await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

  //   if (!coordinadora || !coordinadora.principal) {
  //     throw new InternalServerErrorException("Coordinadora no encontrada");
  //   }
  //   const allCoordinators = [
  //     coordinadora.principal,
  //     ...coordinadora.adicionales,
  //   ];

  //   const isPinValid = allCoordinators.some(
  //     (coordinadora) => coordinadora.id === pin,
  //   );

  //   if (!isPinValid) {
  //     throw new InternalServerErrorException("PIN incorrecto");
  //   }

  //   return true;
  // }

  async execute(idTienda: number, pin: number): Promise<boolean> {
    const coordinadoraData =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

    if (!coordinadoraData || !coordinadoraData.principal) {
      throw new InternalServerErrorException("Coordinadora no encontrada");
    }

    const allCoordinadoras = [
      coordinadoraData.principal,
      ...(coordinadoraData.adicionales || []),
    ];

    const coordinadora = allCoordinadoras.find((c) => c.id === pin);

    if (!coordinadora) {
      return false;
    }

    // ✅ Guardamos la coordinadora validada en memoria temporalmente
    this.lastCoordinadora = {
      uid: coordinadora.idApp,
      idSql: coordinadora.id,
    };

    return true;
  }
}
