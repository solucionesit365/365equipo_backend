import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";

@Injectable()
export class NotificacionHorasExtrasMongoService {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva notificacion de horas extras
  async createNotificacionHorasExtras(data: TNotificacionHorasExtras) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");
    return await notificacionesCollection.insertOne(data);
  }

  //Obtener todas las notificaciones de horas extras
  async getAllNotificacionesHorasExtras() {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection.find({}).toArray();
  }

  async getNotificacionHorasExtrasByIdSql(idSql: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection
      .find({ creadorIdsql: idSql })
      .toArray();
  }
}
