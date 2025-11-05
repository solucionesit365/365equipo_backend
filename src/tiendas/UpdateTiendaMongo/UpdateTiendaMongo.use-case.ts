import { Injectable } from "@nestjs/common";
import {
  IUpdateTiendaMongo,
  IUpdateTiendaMongoUseCase,
} from "./IUpdateTiendaMongo.use-case";
import { ITiendaMongoRepository } from "../repository/ITiendaAtenea.repository";
import { ObjectId } from "mongodb";

@Injectable()
export class UpdateTiendaMongoUseCase implements IUpdateTiendaMongoUseCase {
  constructor(private readonly tiendaMongoRepository: ITiendaMongoRepository) {}

  execute(id: string, payload: IUpdateTiendaMongo): Promise<void> {
    return this.tiendaMongoRepository.update(new ObjectId(id), payload);
  }
}
