import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { EncargosInterface } from "./encargos.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class EncargosDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async newEncargo(encargo: EncargosInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const encargos = db.collection<EncargosInterface>("encargos");

    const resInsert = await encargos.insertOne(encargo);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getEncargos(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const encargos = db.collection<EncargosInterface>("encargos");

    return await encargos.find({ idTienda: idTienda }).toArray();
  }

  async updateEncargo(encargo: EncargosInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection = db.collection<EncargosInterface>("encargos");

    const response = await auditoriasCollection.updateOne(
      {
        _id: new ObjectId(encargo._id),
      },
      {
        $set: {
          recogido: encargo.recogido,
          horaEntrega: encargo.horaEntrega,
        },
      },
    );

    return response.acknowledged;
  }

  async getAllEncargos() {
    const db = (await this.mongoDbService.getConexion()).db();
    const encargos = db.collection<EncargosInterface>("encargos");
    return await encargos.find().toArray();
  }
}
