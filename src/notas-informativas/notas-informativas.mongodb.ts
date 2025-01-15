import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { FirebaseService } from "../firebase/firebase.service";
import { NotasInformativas } from "./notas-informativas.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class NotasInformativasDatabes {
  constructor(
    private readonly mongoDbService: MongoService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.deleteNotasInformativasCaducidad().catch((err) => {
      console.error("Error setting up TTL index:", err);
    });
  }

  async nuevaNotaInformativa(nota: NotasInformativas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    const resInsert = await notasCollection.insertOne(nota);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nota informativa");
  }

  async getNotasInformativas(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    if (idTienda) {
      return await notasCollection
        .find({ tiendas: { $in: [idTienda, -1] } })
        .toArray();
    }
    return await notasCollection.find({}).toArray();
  }

  async getAllNotasInformativas() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    return await notasCollection.find({}).toArray();
  }
  async getNotasInformativasById(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    const respNotas = await notasCollection
      .find({ _id: new ObjectId(_id) })
      .toArray();
    return respNotas;
  }

  async borrarNotasInformativas(notas: NotasInformativas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    const resDelete = await notasCollection.deleteOne({
      _id: new ObjectId(notas._id),
    });
    if (resDelete.deletedCount > 0) return true;
    throw Error("No se ha podido borrar la(s) notas informativas");
  }

  //Eliminacion automatica de las notas informativas por su caducidad y eliminar el storage
  private async deleteNotasInformativasCaducidad() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");

    // Encontrar notas informativas caducadas
    const caducadas = await notasCollection
      .find({ caducidad: { $lte: new Date() } })
      .toArray();

    // Eliminar notas informativas caducadas y sus archivos correspondientes
    for (const nota of caducadas) {
      // Eliminar archivos de Firebase Storage
      if (nota.pdfNotainformativa && nota.pdfNotainformativa.length > 0) {
        await this.firebaseService.borrarArchivo(nota.pdfNotainformativa);
      }

      // Eliminar la nota informativa de la base de datos
      await this.borrarNotasInformativas(nota);
    }

    // Creando el índice TTL para la propiedad 'caducidad'
    await notasCollection.createIndex(
      { caducidad: 1 },
      { expireAfterSeconds: 0 },
    );
  }
}
