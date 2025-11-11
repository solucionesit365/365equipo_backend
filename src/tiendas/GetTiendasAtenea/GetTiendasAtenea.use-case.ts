import { Injectable } from "@nestjs/common";
import { IGetTiendasAteneaUseCase } from "./IGetTiendasAtenea.use-case";
import { Tiendas2 } from "../tiendas.dto";
import { ITiendaMongoRepository } from "../repository/ITiendaAtenea.repository";

@Injectable()
export class GetTiendasAteneaUseCase implements IGetTiendasAteneaUseCase {
  constructor(private readonly tiendaAteneaRepository: ITiendaMongoRepository) {}

  execute(): Promise<Tiendas2[]> {
    return this.tiendaAteneaRepository.getTiendasAtenea();
  }
}
