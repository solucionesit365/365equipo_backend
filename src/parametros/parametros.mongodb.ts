import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { ParametrosDTO } from "./parametros.dto";
// import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class ParametrosDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async getParametros() {
    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametrosDTO>("parametros");
    return await parametrosCollection.find().toArray();
  }
}
