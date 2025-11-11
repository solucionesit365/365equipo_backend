import { DeleteResult } from "mongodb";

export abstract class IDeleteTiendaMongoUseCase {
  abstract execute(_id: string): Promise<DeleteResult>;
}
