import { InsertOneResult } from "mongodb";
import { ICreateTiendaMongo } from "../repository/ITiendaAtenea.repository";

export abstract class ICreateTiendaMongoUseCase {
  abstract execute(
    payload: ICreateTiendaMongo,
  ): Promise<InsertOneResult<ICreateTiendaMongo>>;
}
