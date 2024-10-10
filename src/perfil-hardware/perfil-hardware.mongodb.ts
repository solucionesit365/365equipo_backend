import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { PerfilHardwareService } from "./perfil-hardware.service";
import { ObjectId } from "mongodb";
import { PerfilHardware } from "./perfil-hardware.interface";

@Injectable()
export class PerfilHardwareDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async newPerfilHardware(perfilHard: PerfilHardware) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const perfilesHardwareColl =
      db.collection<PerfilHardware>("perfilesHardware");

    const resInsert = await perfilesHardwareColl.insertOne(perfilHard);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }
}
