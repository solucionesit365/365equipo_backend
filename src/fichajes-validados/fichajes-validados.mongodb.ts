import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class FichajesValidadosDatabase {
  constructor(private readonly mongoDbService: MongoDbService) { }

  async insertarFichajeValidado(fichajeValidado: FichajeValidadoDto) {
    fichajeValidado._id = new ObjectId().toString();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados");
    const resInsert = await cuadrantesCollection.insertOne(fichajeValidado);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getFichajesValidados(idTrabajador: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeValidadoDto>("fichajesValidados");

    return await fichajesCollection.find({ idTrabajador }).toArray();
  }

  async updateFichajesValidados(fichajesValidados: FichajeValidadoDto) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones")
    const fichajesValidadosCollect = db.collection<FichajeValidadoDto>("fichajesValidados");
    const id = fichajesValidados._id;
    delete fichajesValidados._id;
    const respFichajes = await fichajesValidadosCollect.updateOne(
      {
        _id: id,
      },
      {
        $set: fichajesValidados,
      },
    );
    return respFichajes
  }

  async getFichajesPagar(idResponsable: number, aPagar: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones")
    const fichajesValidadosCollect = db.collection<FichajeValidadoDto>("fichajesValidados");

    return await fichajesValidadosCollect.find({ idResponsable, aPagar }).toArray()
  }

  async getAllFichajesPagar(aPagar: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones")
    const fichajesValidadosCollect = db.collection<FichajeValidadoDto>("fichajesValidados");

    return await fichajesValidadosCollect.find({aPagar }).toArray()
  }

  async getAllFichajesValidados() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeValidadoDto>("fichajesValidados");

    return await fichajesCollection.find({}).toArray();
  }
}
