import { Injectable } from "@nestjs/common";
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

    return await this.coordinadoraRepository.getSubordinadosCoordinadora(
      coordinadora.id,
    );
  }
}
