import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { ParametrosDTO } from "./parametros.dto";
// import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class ParametrosDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async getParametros(name: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametrosDTO>("parametros");
    return await parametrosCollection.find({ name: name }).toArray();
  }
  async updateParametros(name: string, parametros) {
    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametrosDTO>("parametros");
    const result = await parametrosCollection.updateOne(
      { name: name },
      { $set: { lastSyncWorkers: parametros } },
    );

    return result;
  }
}
