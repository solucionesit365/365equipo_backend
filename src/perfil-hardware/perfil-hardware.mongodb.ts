import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
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

  async getPerfilesH() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const perfiles = db.collection<PerfilHardware>("perfilesHardware");

    return await perfiles.find({}).toArray();
  }

  async deletePerfil(perfil: PerfilHardware) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const perfiles = db.collection<PerfilHardware>("perfilesHardware");

    const respPerfiles = await perfiles.deleteOne({
      _id: new ObjectId(perfil._id),
    });
    return respPerfiles.acknowledged && respPerfiles.deletedCount > 0;
  }
}
