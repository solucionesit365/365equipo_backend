import { Injectable } from "@nestjs/common";
import { IGetTiendasAteneaUseCase } from "./IGetTiendasAtenea.use-case";
import { Tiendas2 } from "../tiendas.dto";
import { ITiendaAteneaRepository } from "../repository/ITiendaAtenea.repository";

@Injectable()
export class GetTiendasAteneaUseCase implements IGetTiendasAteneaUseCase {
  constructor(private readonly tiendaAteneaRepository: ITiendaAteneaRepository) {}

  execute(): Promise<Tiendas2[]> {
    return this.tiendaAteneaRepository.getTiendasAtenea();
  }
}
