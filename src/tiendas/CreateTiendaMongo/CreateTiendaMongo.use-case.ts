import { Injectable } from "@nestjs/common";
import { ICreateTiendaMongoUseCase } from "./ICreateTiendaMongo.use-case";
import {
  ICreateTiendaMongo,
  ITiendaMongoRepository,
} from "../repository/ITiendaAtenea.repository";
import { InsertOneResult } from "mongodb";

@Injectable()
export class CreateTiendaMongoUseCase implements ICreateTiendaMongoUseCase {
  constructor(private readonly tiendaMongoRepository: ITiendaMongoRepository) {}

  execute(
    payload: ICreateTiendaMongo,
  ): Promise<InsertOneResult<ICreateTiendaMongo>> {
    return this.tiendaMongoRepository.createTienda(payload);
  }
}
