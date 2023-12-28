import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import {
  CalendarioFestivosInterface,
  eventoNavideño,
} from "./calendario-festivos.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class CalendarioFestivosDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async nuevoFestivo(festivo: CalendarioFestivosInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<CalendarioFestivosInterface>("calendarioFestivos");

    const resInsert = await calendarioCollection.insertOne(festivo);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el nuevo festivo");
  }

  async getFestivos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<CalendarioFestivosInterface>("calendarioFestivos");

    // Filtrar para obtener solo documentos que NO contienen 'idUsuario'
    const respCalendario = await calendarioCollection.find({}).toArray();

    return respCalendario;
  }

  async getFestivosByTienda(tienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<CalendarioFestivosInterface>("calendarioFestivos");

    if (tienda) {
      return await calendarioCollection
        .find({ tienda: { $in: [tienda, -1] } })
        .toArray();
    }
    return await calendarioCollection.find({}).toArray();
  }

  async updateFestivo(festivo: CalendarioFestivosInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<CalendarioFestivosInterface>("calendarioFestivos");

    const resUpdate = await calendarioCollection.updateOne(
      {
        _id: new ObjectId(festivo._id),
      },
      {
        $set: {
          titulo: festivo.titulo,
          descripcion: festivo.descripcion,
          fechaInicio: festivo.fechaInicio,
          fechaFinal: festivo.fechaFinal,
          categoria: festivo.categoria,
          color: festivo.color,
          tienda: festivo.tienda,
        },
      },
    );
    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar el evento");
  }

  //Notifcacion navideña
  async nuevoEvento(festivo: eventoNavideño) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<eventoNavideño>("invitacionNavidad");

    const resInsert = await calendarioCollection.insertOne(festivo);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el nuevo festivo");
  }

  async verificacionRespuesta(idUsuario: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<eventoNavideño>("invitacionNavidad");

    // Verifica si existe al menos una respuesta
    const respuestaExiste = await calendarioCollection.findOne({
      idUsuario: idUsuario,
    });

    return respuestaExiste != null; // Devuelve true si existe una respuesta, de lo contrario false
  }

  async getEventos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<eventoNavideño>("invitacionNavidad");
    // Filtrar para obtener solo documentos que contienen 'idUsuario'
    const respCalendario = await calendarioCollection.find({}).toArray();

    return respCalendario;
  }

  async getEventosByAsistirOrNo(asistira: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const calendarioCollection =
      db.collection<eventoNavideño>("invitacionNavidad");
    const asistiraBoolean = asistira == "true" ? true : false;

    if (asistira) {
      return await calendarioCollection
        .find({ asistira: asistiraBoolean })
        .toArray();
    }
    return await calendarioCollection.find({}).toArray();
  }
}
