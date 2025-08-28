import { MongoService } from "../mongo/mongo.service";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";

@Injectable()
export class InspeccionFichajesService {
  constructor(private readonly mongoDbService: MongoService) {}

  async getInspeccionFichajes() {
    const db = (await this.mongoDbService.getConexion()).db();
    const inspeccionFichajes = db.collection("inspeccionFichajes");

    return await inspeccionFichajes.find().toArray();
  }

  async createInspeccionFichajes(data: any) {
    const db = (await this.mongoDbService.getConexion()).db();
    const inspeccionFichajes = db.collection("inspeccionFichajes");

    const resInsert = await inspeccionFichajes.insertOne(data);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }
  async updateInspeccionFichajes(id: string, data: any) {
    const db = (await this.mongoDbService.getConexion()).db();
    const inspeccionFichajes = db.collection("inspeccionFichajes");

    const resUpdate = await inspeccionFichajes.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          activo: data.activo,
          usedTime: data.usedTime,
        },
      },
    );

    return resUpdate.acknowledged;
  }

  async validarPin(pin: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const config = db.collection("inspeccionFichajes");
    const configData = await config.findOne({ pin: pin, activo: true });
    if (configData && pin === configData.pin) {
      return configData ?? null;
    } else {
      return null;
    }
  }
}
