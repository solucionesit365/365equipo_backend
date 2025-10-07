import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { ObjectId } from "mongodb";
import { FurgonetaDto, InspeccionFurgos } from "./inspeccion-furgos.dto";

@Injectable()
export class InspeccionFurgosDatabes {
  constructor(private readonly mongoDbService: MongoService) {}

  private async getCollection() {
    const db = (await this.mongoDbService.getConexion()).db();
    return db.collection<InspeccionFurgos>("inspeccionesFurgos");
  }

  private async getCollection2() {
    const db = (await this.mongoDbService.getConexion()).db();
    return db.collection<FurgonetaDto>("furgonetas");
  }

  async nuevaInspeccion(inspeccion: InspeccionFurgos) {
    const collection = await this.getCollection();
    const resInsert = await collection.insertOne(inspeccion);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw new Error("No se ha podido insertar la inspección de furgo");
  }

  async getAllInspecciones() {
    const collection = await this.getCollection();
    return await collection.find({}).toArray();
  }

  async getInspeccionesByMatricula(matricula: string) {
    const collection = await this.getCollection();
    return await collection.find({ matricula }).toArray();
  }

  // async getTransportistas() {
  //   const collection = await this.getCollection();
  //   const transportistas = await collection
  //     .find({ tienda: "transporte" }, { projection: { nombre: 1, _id: 0 } })
  //     .toArray();

  //   return transportistas.map((t) => t.nombreConductor);
  // }

  async borrarInspeccion(_id: string) {
    const collection = await this.getCollection();
    const resDelete = await collection.deleteOne({ _id: new ObjectId(_id) });
    if (resDelete.deletedCount > 0) return true;
    throw new Error("No se ha podido borrar la inspección de furgo");
  }

  async crearFurgoneta(matricula: string) {
    const collection = await this.getCollection2();

    const existe = await collection.findOne({ matricula });
    if (existe) {
      throw new Error("Ya existe una furgoneta con esa matrícula");
    }

    const resInsert = await collection.insertOne({
      matricula,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    throw new Error("No se ha podido crear la furgoneta");
  }

  async getAllFurgonetas() {
    const collection = await this.getCollection2();
    return await collection.find({}).toArray();
  }
}
