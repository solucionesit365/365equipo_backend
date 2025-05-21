import { Injectable, InternalServerErrorException } from "@nestjs/common";
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

    // Paso 1: Eliminar solo el objeto del array horasExtras
    const result = await notificacionesCollection.updateOne(
      { "horasExtras._id": idHorasExtras },
      { $pull: { horasExtras: { _id: idHorasExtras } } },
    );

    if (result.modifiedCount === 0) {
      return {
        deleted: false,
        message: "No se encontró la notificación con ese ID.",
      };
    }

    // Paso 2: Ver si el documento quedó con horasExtras vacío
    const emptyDoc = await notificacionesCollection.findOne({
      horasExtras: { $exists: true },
      "horasExtras.0": { $exists: false },
    });

    if (emptyDoc) {
      await notificacionesCollection.deleteOne({ _id: emptyDoc._id });
      return {
        deleted: true,
        message: "Objeto eliminado y documento borrado por estar vacío.",
      };
    }

    return {
      deleted: true,
      message: "Objeto eliminado del array horasExtras.",
    };
  }

  //Update una notificacion de horas extras
  async updateNotificacionHorasExtras(
    id: string,
    horaExtraId: string,
    data: TNotificacionHorasExtras,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    // Encontrar la hora extra que se quiere modificar (según el _id que es string)
    const horaExtra = data.horasExtras?.find((h) => h._id === horaExtraId);

    if (!horaExtra) {
      throw new InternalServerErrorException(
        "Hora extra no válida o no encontrada",
      );
    }

    // 1. Actualizar el campo 'trabajador' directamente (sin depender de horasExtras)
    const res1 = await notificacionesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { trabajador: data.trabajador } },
    );

    // 2. Actualizar los campos dentro del subdocumento `horasExtras`
    const res2 = await notificacionesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "horasExtras.$[elem].motivo": horaExtra.motivo,
          "horasExtras.$[elem].fecha": horaExtra.fecha,
          "horasExtras.$[elem].horaInicio": horaExtra.horaInicio,
          "horasExtras.$[elem].horaFinal": horaExtra.horaFinal,
        },
      },
      {
        arrayFilters: [{ "elem._id": horaExtraId }], // ⬅ importante: el ID es string
      },
    );

    const actualizoAlgo = res1.modifiedCount > 0 || res2.modifiedCount > 0;
    if (!actualizoAlgo) {
      throw new InternalServerErrorException(
        "No se actualizó ningún campo del documento",
      );
    }

    return { message: "Datos actualizados correctamente" };
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

  async buscarCoincidenciasHorasExtras(
    dniTrabajador: string,
    horasExtras: {
      tienda: string;
      fecha: string;
      horaInicio: string;
      horaFinal: string;
    }[],
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection("notificacionesHorasExtras");

    const condiciones = horasExtras.map((h) => ({
      horasExtras: {
        $elemMatch: {
          tienda: h.tienda,
          fecha: h.fecha,
          $or: [
            {
              $and: [
                { horaInicio: { $lte: h.horaInicio } },
                { horaFinal: { $gte: h.horaInicio } },
              ],
            },
            {
              $and: [
                { horaInicio: { $lte: h.horaFinal } },
                { horaFinal: { $gte: h.horaFinal } },
              ],
            },
          ],
        },
      },
    }));

    return await notificacionesCollection
      .find({
        dniTrabajador: dniTrabajador,
        $or: condiciones,
      })
      .toArray();
  }
}
