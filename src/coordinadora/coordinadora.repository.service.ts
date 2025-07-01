import { Injectable } from "@nestjs/common";
import { CoordinadoraDatabaseService } from "./coordinadora.database";

@Injectable()
export class CoordinadoraRepositoryService {
  constructor(
    private readonly coordinadoraDatabaseService: CoordinadoraDatabaseService,
  ) {}

  getCoordinadoraPorTienda(idTienda: number) {
    return this.coordinadoraDatabaseService.getCoordinadoraPorTienda(idTienda);
  }
}
