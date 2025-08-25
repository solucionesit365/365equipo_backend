import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { ParametrosDTO, ParametroDTO2 } from "./parametros.dto";

@Injectable()
export class ParametrosDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async getParametros(name: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametrosDTO>("parametros");
    return await parametrosCollection.find({ name: name }).toArray();
  }

  async getParametrosCampaniaMedica() {
    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametroDTO2>("parametros");
    return await parametrosCollection.findOne({
      name: "configurar_campaña_medica",
    });
  }

  async updateParametros(name: string, parametros: Partial<ParametrosDTO>) {
    if (parametros?._id) delete parametros._id;

    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametrosDTO>("parametros");
    const result = await parametrosCollection.updateOne(
      { name: name },
      { $set: parametros },
    );

    return result;
  }

  async updateParametros2(name: string, parametros: Partial<ParametroDTO2>) {
    if (parametros?._id) delete parametros._id;

    const db = (await this.mongoDbService.getConexion()).db();
    const parametrosCollection = db.collection<ParametroDTO2>("parametros");
    const result = await parametrosCollection.updateOne(
      { name: name },
      { $set: parametros },
      { upsert: true },
    );

    return result;
  }
}
