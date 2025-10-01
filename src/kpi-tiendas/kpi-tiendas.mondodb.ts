import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { KpiTiendasInterface } from "./kpi-tiendas.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class KpiTiendasDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevoKPI(kpiTienda: KpiTiendasInterface) {
    kpiTienda._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db();
    const kpiTiendaCollection =
      db.collection<KpiTiendasInterface>("kpiTiendas");
    const resInsert = await kpiTiendaCollection.insertOne(kpiTienda);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la incidencia");
  }
  async getKPIS(semana: number, año: number, tienda: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const kpiTiendaCollection =
      db.collection<KpiTiendasInterface>("kpiTiendas");

    const respKPIS = await kpiTiendaCollection
      .find({ semana, año, tienda })
      .toArray();

    return respKPIS;
  }

  async getAllKPIs(semana: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const kpiTiendaCollection =
      db.collection<KpiTiendasInterface>("kpiTiendas");

    const respKPIS = await kpiTiendaCollection.find({ semana, año }).toArray();

    return respKPIS;
  }

  async borrarKPITienda(kpiTienda: KpiTiendasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const kpiTiendaCollection =
      db.collection<KpiTiendasInterface>("kpiTiendas");
    const respKPIS = await kpiTiendaCollection.deleteOne({
      _id: new ObjectId(kpiTienda._id),
    });
    return respKPIS.acknowledged && respKPIS.deletedCount > 0;
  }

  async borrarKPIsPorSemana(semana: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const kpiTiendaCollection =
      db.collection<KpiTiendasInterface>("kpiTiendas");
    const respKPIS = await kpiTiendaCollection.deleteMany({ semana, año });
    return respKPIS.acknowledged && respKPIS.deletedCount > 0;
  }
}
