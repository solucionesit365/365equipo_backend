import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ICoordinadoraRepository } from "../repository/interfaces/ICoordinadora.repository";
import { ICheckPINCoordinadoraUseCase } from "./interfaces/ICheckPINCoordinadora.use.case";

@Injectable()
export class CheckPINCoordinadoraUseCase
  implements ICheckPINCoordinadoraUseCase
{
  private lastCoordinadora: {
    uid: string;
    idSql: number;
    uid2: string;
    idSql2: number;
  } | null = null;
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

    // Guardar primero la que valida (B) y luego la coordinadora principal (A) en uid2/idSql2
    this.lastCoordinadora = {
      uid: coordinadora.idApp,
      idSql: coordinadora.id,
      uid2: coordinadoraData.principal.idApp,
      idSql2: coordinadoraData.principal.id,
    };

    return true;
  }
}
