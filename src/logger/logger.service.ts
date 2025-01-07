import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { TLogger, TLoggerCollection } from "./logger.dto";
import { DateTime } from "luxon";

@Injectable()
export class LoggerService {
  constructor(private readonly mongoService: MongoService) {}

  async create(data: TLogger) {
    if (data.name && data.action) {
      const db = (await this.mongoService.getConexion()).db("soluciones");
      const loggerCollection = db.collection<TLoggerCollection>("logger");
      await loggerCollection.insertOne({
        action: data.action,
        datetime: DateTime.now().toJSDate(),
        name: data.name,
        extraData: data.extraData,
      });
    } else
      throw new InternalServerErrorException(
        "Fallo al crear el logger, información incorrecta",
      );
  }

  async getLogs() {
    try {
      const db = (await this.mongoService.getConexion()).db("soluciones");
      const loggerCollection = db.collection<TLoggerCollection>("logger");
      return await loggerCollection.find().toArray();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Error al obtener logs");
    }
  }
}
