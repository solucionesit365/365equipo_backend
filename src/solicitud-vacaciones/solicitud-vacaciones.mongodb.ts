import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";

@Injectable()
export class SolicitudVacacionesBdd {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const resInsert = await solicitudVacacionesCollection.insertOne(
      solicitudVacaciones,
    );
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }
}
