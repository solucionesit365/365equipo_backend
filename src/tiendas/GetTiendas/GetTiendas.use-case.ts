import { Injectable } from "@nestjs/common";
import { IGetTiendasUseCase } from "./IGetTiendas.use-case";
import { Tienda } from "@prisma/client";
import { ITiendaRepository } from "../repository/ITienda.repository";

@Injectable()
export class GetTiendasUseCase implements IGetTiendasUseCase {
  constructor(private readonly tiendaRepository: ITiendaRepository) {}

  execute(): Promise<Tienda[]> {
    return this.tiendaRepository.getTiendas();
  }
}
