import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { FichajeDto } from "./fichajes.interface";

@Injectable()
export class FichajesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async nuevaEntrada(uid: string, hora: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "ENTRADA",
      uid,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async nuevaSalida(uid: string, hora: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "SALIDA",
      uid,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getFichajesDia(uid: string, fecha: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Busca los documentos que coincidan con el rango de fechas
    return await fichajesCollection
      .find({
        uid,
        fecha: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .sort({ fecha: 1 })
      .toArray();
  }
}
