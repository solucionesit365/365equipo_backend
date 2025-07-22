import { Injectable, PreconditionFailedException } from "@nestjs/common";
import { IGetEquipoCoordinadoraPorTienda } from "./GetEquipoCoordinadoraPorTiendaInterface";
import { ICoordinadoraRepository } from "../coordinadora.repository.interface";

@Injectable()
export class GetEquipoCoordinadoraPorTiendaUseCase
  implements IGetEquipoCoordinadoraPorTienda
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
  ) {}

  async execute(idTienda: number) {
    // Obtengo primero el id de la coordinadora de la tienda
    const coordinadora =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

    if (!coordinadora)
      throw new PreconditionFailedException({
        message: "Es necesario tener una coordinadora en la tienda",
        code: "SIN_COORDINADORA",
      });

    return [
      ...(await this.coordinadoraRepository.getSubordinadosCoordinadora(
        coordinadora.id,
      )),
      coordinadora,
    ];
  }
}
