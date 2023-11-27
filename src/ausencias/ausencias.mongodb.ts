import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { AusenciaInterface } from "./ausencias.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class AusenciasDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

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

  async updateAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resUpdate = await ausenciasCollection.updateOne(
      {
        _id: new ObjectId(ausencia._id),
      },
      {
        $set: {
          fechaInicio: moment(ausencia.fechaInicio, "DD/MM/YYYY").toDate(),
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
        },
      },
    );
    console.log(ausencia);

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resUpdate = await ausenciasCollection.updateOne(
      {
        _id: new ObjectId(ausencia._id),
      },
      {
        $set: {
          fechaInicio: moment(ausencia.fechaInicio, "DD/MM/YYYY").toDate(),
          fechaFinal: moment(ausencia.fechaFinal, "DD/MM/YYYY").toDate(),
          fechaRevision: ausencia.fechaRevision
            ? moment(ausencia.fechaRevision, "DD/MM/YYYY").toDate()
            : null,
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
        },
      },
    );
    console.log(ausencia.fechaRevision);

    console.log(ausencia);

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async getAusencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.find({}).toArray();

    return respAusencia;
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
