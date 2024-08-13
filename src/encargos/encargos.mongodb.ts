import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { EncargosInterface } from "./encargos.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class EncargosDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async newEncargo(encargo: EncargosInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<EncargosInterface>("encargos");

    const resInsert = await anuncios.insertOne(encargo);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getEncargos(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const encargos = db.collection<EncargosInterface>("encargos");

    console.log(idTienda);

    return await encargos.find({ idTienda: idTienda }).toArray();
  }

  async updateEncargo(encargo: EncargosInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const auditoriasCollection = db.collection<EncargosInterface>("encargos");

    console.log(encargo);

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
}
