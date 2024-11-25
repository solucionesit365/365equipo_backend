import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { AusenciaInterface } from "./ausencias.interface";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";

@Injectable()
export class AusenciasDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resInsert = await ausenciasCollection.insertOne(ausencia);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva ausencia");
  }

  async deleteAusencia(idAusencia: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resDelete = await ausenciasCollection.deleteOne({
      _id: new ObjectId(idAusencia),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  async eliminarCuadrantesFueraDeRango(
    idUsuario: number,
    nuevaFechaInicio: Date,
    nuevaFechaFinal: Date,
    tipo: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const collection = db.collection("cuadrantes2");

    // Eliminar cuadrantes que ya no caen dentro del nuevo rango de fechas
    const resultado = await collection.deleteMany({
      idTrabajador: idUsuario,
      "ausencia.tipo": tipo,
      $or: [
        { inicio: { $lt: nuevaFechaInicio } },
        { final: { $gt: nuevaFechaFinal } },
      ],
    });

    console.log(`Cuadrantes eliminados: ${resultado.deletedCount}`);
  }

  async updateAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    // Verificar si la ausencia tiene 'tienda' como null
    const currentAusencia = await ausenciasCollection.findOne({
      _id: new ObjectId(ausencia._id),
    });

    // Determinar si se debe actualizar el campo 'tienda'
    let tiendaUpdate = {};
    if (currentAusencia && currentAusencia.tienda === null && ausencia.tienda) {
      tiendaUpdate = { tienda: ausencia.tienda };
    }

    // Realizar la actualización para todos los campos excepto 'tienda' si no se permite
    const resUpdate = await ausenciasCollection.updateOne(
      { _id: new ObjectId(ausencia._id) },
      {
        $set: {
          fechaInicio: ausencia.fechaInicio,
          fechaFinal: ausencia.fechaFinal,
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
          ...tiendaUpdate, // Actualizar 'tienda' solo si inicialmente era null
        },
      },
    );

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    // Verificar si la ausencia tiene 'tienda' como null
    const currentAusencia = await ausenciasCollection.findOne({
      _id: new ObjectId(ausencia._id),
    });

    // Determinar si se debe actualizar el campo 'tienda'
    let tiendaUpdate = {};
    if (currentAusencia && currentAusencia.tienda === null && ausencia.tienda) {
      tiendaUpdate = { tienda: ausencia.tienda };
    }

    // Realizar la actualización para todos los campos excepto 'tienda' si no se permite
    const resUpdate = await ausenciasCollection.updateOne(
      { _id: new ObjectId(ausencia._id) },
      {
        $set: {
          fechaInicio: ausencia.fechaInicio,
          fechaFinal: ausencia.fechaFinal,
          fechaRevision: ausencia.fechaRevision ? ausencia.fechaRevision : null,
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
          ...tiendaUpdate, // Actualizar 'tienda' solo si inicialmente era null
        },
      },
    );

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async getAusencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.find({}).toArray();

    return respAusencia;
  }

  async getAusenciasIntervalo(fechaInicio: DateTime, fechaFinal: DateTime) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    // Convertir fechas de DateTime a Date de JS si es necesario
    const inicio = fechaInicio.toJSDate(); // Asumiendo que fechaInicio es un objeto DateTime que necesita ser convertido
    const final = fechaFinal.toJSDate(); // Lo mismo para fechaFinal

    const query = {
      $or: [
        // Condición 1: La ausencia comienza dentro del intervalo
        { fechaInicio: { $gte: inicio, $lte: final } },
        // Condición 2: La ausencia termina dentro del intervalo
        { fechaFinal: { $gte: inicio, $lte: final } },
        // Condición 3: La ausencia comienza antes y termina después del intervalo
        { fechaInicio: { $lte: inicio }, fechaFinal: { $gte: final } },
      ],
    };

    const ausencias = await ausenciasCollection.find(query).toArray();

    return ausencias;
  }

  async getAusenciasById(idAusencia: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    return await ausenciasCollection.findOne({ _id: idAusencia });
  }

  async getAusenciasSincro() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection
      .find({ enviado: { $ne: true } })
      .toArray();

    return respAusencia;
  }

  async marcarComoEnviada(id: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.updateOne(
      { _id: id },
      {
        $set: {
          enviado: true,
        },
      },
    );

    return respAusencia.acknowledged;
  }
}
