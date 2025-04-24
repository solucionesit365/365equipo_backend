import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class NotificacionHorasExtrasMongoService {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva notificacion de horas extras
  async createNotificacionHorasExtras(data: TNotificacionHorasExtras) {
    // Asegurarse de que cada elemento en horasExtras tenga un _id en formato string
    if (Array.isArray(data.horasExtras)) {
      data.horasExtras = data.horasExtras.map((horaExtra) => ({
        _id: horaExtra._id || new ObjectId().toHexString(),
        ...horaExtra,
      }));
    }
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

  //Actualizar una notificacion de horas extras
  async updateNotificacionHorasExtrasRevision(
    id: string,
    horaExtraId: string,
    data: { revision?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "horasExtras._id": horaExtraId },
      {
        $set: {
          "horasExtras.$.revision": data.revision,
        },
      },
    );
  }

  async updateNotificacionHorasExtrasApagar(
    id: string,
    horaExtraId: string,
    data: { apagar?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");
    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "horasExtras._id": horaExtraId },
      {
        $set: {
          "horasExtras.$.apagar": data.apagar,
        },
      },
    );
  }

  //Eliminar una notificacion de horas extras
  async deleteNotificacionHorasExtras(idHorasExtras: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection.deleteOne({
      _id: new ObjectId(idHorasExtras),
    });
  }

  //Update una notificacion de horas extras
  async updateNotificacionHorasExtras(
    id: string,
    horaExtraId: string,
    data: TNotificacionHorasExtras,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    const horaExtra = data.horasExtras?.[0];
    if (!horaExtra) {
      return {
        ok: false,
        message: "No se proporcionó información válida para la hora extra",
      };
    }

    const result = await notificacionesCollection.updateOne(
      {
        _id: new ObjectId(id),
        "horasExtras._id": horaExtraId,
      },
      {
        $set: {
          trabajador: data.trabajador,
          motivo: data.motivo,

          "horasExtras.$.fecha": horaExtra.fecha,
          "horasExtras.$.horaInicio": horaExtra.horaInicio,
          "horasExtras.$.horaFinal": horaExtra.horaFinal,
        },
      },
    );

    return {
      ok: result.modifiedCount > 0,
      message:
        result.modifiedCount > 0
          ? "Datos actualizados correctamente"
          : "No se encontró o no se modificó nada",
    };
  }

  //update comentario
  async updateComentarioHorasExtras(
    id: string,
    horaExtraId: string,
    comentario: {
      nombre: string;
      fechaRespuesta: string;
      mensaje: string;
    }[],
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "horasExtras._id": horaExtraId },
      {
        $push: {
          "horasExtras.$.comentario": {
            $each: comentario,
          },
        },
      },
    );
  }

  async marcarComentariosComoLeidos(
    id: string,
    horaExtraId: string,
    usuarioId: string,
    fecha: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    return await notificacionesCollection.updateOne(
      {
        _id: new ObjectId(id),
        "horasExtras._id": horaExtraId,
      },
      {
        $set: {
          [`horasExtras.$.ultimosLeidos.${usuarioId}`]: fecha,
        },
      },
    );
  }
}
