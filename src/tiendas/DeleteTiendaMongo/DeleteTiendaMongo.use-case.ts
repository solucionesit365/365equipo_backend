import { Injectable } from "@nestjs/common";
import { IDeleteTiendaMongoUseCase } from "./IDeleteTiendaMongo.use-case";
import { ITiendaMongoRepository } from "../repository/ITiendaAtenea.repository";
import { DeleteResult, ObjectId } from "mongodb";

@Injectable()
export class DeleteTiendaMongoUseCase implements IDeleteTiendaMongoUseCase {
  constructor(private readonly tiendaMongoRepository: ITiendaMongoRepository) {}

  execute(_id: string): Promise<DeleteResult> {
    const objectId = new ObjectId(_id);
    return this.tiendaMongoRepository.delete(objectId);
  }
}
