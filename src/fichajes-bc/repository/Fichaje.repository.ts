import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IFichajeRepository } from "./IFichaje.repository";
import { DateTime } from "luxon";
import { FichajeDto } from "../fichajes.interface";
import { MongoService } from "../../mongo/mongo.service";

@Injectable()
export class FichajeRepository implements IFichajeRepository {
  constructor(private readonly mongoDbService: MongoService) {}

  async getFichajes(
    startSearch: DateTime,
    endSearch: DateTime,
  ): Promise<FichajeDto[]> {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const fichajesCollection = db.collection<FichajeDto>("fichajes");
      return await fichajesCollection
        .find({
          hora: {
            $lte: endSearch.toJSDate(),
            $gt: startSearch.toJSDate(),
          },
        })
        .toArray();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
