import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { TNotificarAmpliacionContratos } from "./notificar-ampliacion-contratos.dto";
import { ObjectId } from "mongodb";

interface Comentario {
  nombre: string;
  fechaRespuesta: string; // ISO string
  mensaje: string;
}

interface AmpliacionJornadaItem {
  _id: string; // o ObjectId
  comentario: Comentario[];
  // ...otros campos
}

export interface NotificacionAmpliacionContratos {
  _id: ObjectId;
  ampliacionJornada: AmpliacionJornadaItem[];
}

@Injectable()
export class NotificarAmpliacionContratosMongoService {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva notificacion de horas extras
  async createNotificarAmpliacionContratos(
    data: TNotificarAmpliacionContratos,
  ) {
    // Asegurarse de que cada elemento en horasExtras tenga un _id en formato string
    if (Array.isArray(data.ampliacionJornada)) {
      data.ampliacionJornada = data.ampliacionJornada.map((horaExtra) => ({
        _id: horaExtra._id || new ObjectId().toHexString(),
        ...horaExtra,
      }));
    }
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.insertOne(data);
  }

  //Obtener todas las notificaciones de horas extras
  async getAllNotificarAmpliacionContratos() {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.find({}).toArray();
  }

  async getNotificarAmpliacionContratosByIdSql(idSql: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection
      .find({ creadorIdsql: idSql })
      .toArray();
  }

  async updateNotificarAmpliacionContratosAmpliacion(
    id: string,
    horaExtraId: string,
    data: { ampliacion?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "ampliacionJornada._id": horaExtraId },
      {
        $set: {
          "ampliacionJornada.$.ampliacion": data.ampliacion,
        },
      },
    );
  }

  async updateNotificarAmpliacionContratosVueltaJornada(
    id: string,
    horaExtraId: string,
    data: { vueltaJornada?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );
    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "ampliacionJornada._id": horaExtraId },
      {
        $set: {
          "ampliacionJornada.$.vueltaJornada": data.vueltaJornada,
        },
      },
    );
  }

  async updateNotificarAmpliacionContratosFirmaGuardado(
    id: string,
    horaExtraId: string,
    data: { firmaGuardado?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );
    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "ampliacionJornada._id": horaExtraId },
      {
        $set: {
          "ampliacionJornada.$.firmaGuardado": data.firmaGuardado,
        },
      },
    );
  }

  async updateNotificarAmpliacionContratosEscritoEnviado(
    id: string,
    horaExtraId: string,
    data: { escritoEnviado?: boolean },
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );
    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "ampliacionJornada._id": horaExtraId },
      {
        $set: {
          "ampliacionJornada.$.escritoEnviado": data.escritoEnviado,
        },
      },
    );
  }

  //Eliminar una notificacion de horas extras
  async deleteNotificarAmpliacionContratos(idHorasExtras: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection<unknown>(
      "notificarAmpliacionContratos",
    );

    // Paso 1: Eliminar solo el objeto del array horasExtras
    const result = await notificacionesCollection.updateOne(
      { "ampliacionJornada._id": idHorasExtras },
      { $pull: { ampliacionJornada: { _id: idHorasExtras } } },
    );

    if (result.modifiedCount === 0) {
      return {
        deleted: false,
        message: "No se encontró la notificación con ese ID.",
      };
    }

    // Paso 2: Ver si el documento quedó con horasExtras vacío
    const emptyDoc = await notificacionesCollection.findOne({
      ampliacionJornada: { $exists: true },
      "ampliacionJornada.0": { $exists: false },
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
      message: "Objeto eliminado del array ampliacionJornadaF.",
    };
  }

  //Update una notificacion de horas extras
  async updateNotificarAmpliacionContratos(
    id: string,
    horaExtraId: string,
    data: TNotificarAmpliacionContratos,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    // Encontrar la hora extra que se quiere modificar (según el _id que es string)
    const horaExtra = data.ampliacionJornada?.find(
      (h) => h._id === horaExtraId,
    );

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
          "ampliacionJornada.$[elem].tipoModificacion":
            horaExtra.tipoModificacion,
          "ampliacionJornada.$[elem].tipoAmpliacion": horaExtra.tipoAmpliacion,
          "ampliacionJornada.$[elem].motivo": horaExtra.motivo,
          "ampliacionJornada.$[elem].fechaInicioAmpliacion":
            horaExtra.fechaInicioAmpliacion,
          "ampliacionJornada.$[elem].fechaFinAmpliacion":
            horaExtra.fechaFinAmpliacion,
          "ampliacionJornada.$[elem].jornadaActual": horaExtra.jornadaActual,
          "ampliacionJornada.$[elem].nuevaJornada": horaExtra.nuevaJornada,
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
  async updateComentarioNotificarAmpliacionContratos(
    id: string,
    horaExtraId: string,
    comentario: {
      nombre: string;
      fechaRespuesta: string;
      mensaje: string;
    }[],
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection<unknown>(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.updateOne(
      { _id: new ObjectId(id), "ampliacionJornada._id": horaExtraId },
      {
        $push: {
          "ampliacionJornada.$.comentario": {
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
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.updateOne(
      {
        _id: new ObjectId(id),
        "ampliacionJornada._id": horaExtraId,
      },
      {
        $set: {
          [`ampliacionJornada.$.ultimosLeidos.${usuarioId}`]: fecha,
        },
      },
    );
  }

  async buscarCoincidenciasAmpliacionContratos(
    dniTrabajador: string,
    ampliacionJornada: {
      tienda: string;
      fecha: string;
      horaInicio: string;
      horaFinal: string;
    }[],
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    const condiciones = ampliacionJornada.map((h) => ({
      ampliacionJornada: {
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
  async getNotificacionAmpliacionContratosById(id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const notificacionesCollection = db.collection(
      "notificarAmpliacionContratos",
    );

    return await notificacionesCollection.findOne({
      _id: new ObjectId(id),
    });
  }
}
