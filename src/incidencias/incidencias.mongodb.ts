import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { Incidencias, IncidenciasInvitado } from "./incidencias.interface";
import { ObjectId } from "mongodb";
import { toArray } from "rxjs";

@Injectable()
export class IncidenciasDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaIncidencia(incidencias: Incidencias) {
    incidencias._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const resInsert = await incidenciasCollection.insertOne(incidencias);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la incidencia");
  }
  //Incidencia Invitado
  async nuevaIncidenciaInvitado(incidencia: IncidenciasInvitado) {
    incidencia._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection =
      db.collection<IncidenciasInvitado>("incidencias");
    const resInsert = await incidenciasCollection.insertOne(incidencia);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la incidencia Invitado");
  }

  async getIncidencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection.find({}).toArray();

    return respIncidencias;
  }

  async getIncidenciasRrhh() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection.find({}).toArray();

    return respIncidencias;
  }

  async getIncidenciasByEstado(estado: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ estado })
      .toArray();

    return respIncidencias;
  }

  async getIncidenciasEstadoRrhh(estado: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ estado })
      .toArray();

    return respIncidencias;
  }

  async getIncidenciasByCategoria(categoria: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ categoria })
      .toArray();

    return respIncidencias;
  }

  async getIncidenciasByCategoriaRrhh(categoria: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ categoria })
      .toArray();

    return respIncidencias;
  }

  async getIncidenciasByPrioridad(prioridad: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ prioridad })
      .toArray();

    return respIncidencias;
  }

  async getIncidenciasByPrioridadRrhh(prioridad: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection
      .find({ prioridad })
      .toArray();

    return respIncidencias;
  }

  // cambiar estado
  async updateIncidenciaEstado(incidencias: Incidencias) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");

    const respIncidencias = await incidenciasCollection.updateOne(
      {
        _id: new ObjectId(incidencias._id),
      },
      {
        $set: {
          estado: incidencias.estado,
        },
      },
    );

    if (respIncidencias.acknowledged && respIncidencias.modifiedCount > 0)
      return true;
    throw Error("No se ha podido modificar el estado");
  }

  async updateIncidenciaMensajes(incidencias: Incidencias) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");

    const respIncidencias = await incidenciasCollection.updateOne(
      {
        _id: new ObjectId(incidencias._id),
      },
      {
        $set: {
          mensajes: incidencias.mensajes,
        },
      },
    );

    if (respIncidencias.acknowledged && respIncidencias.modifiedCount > 0)
      return true;
    throw Error("No se ha podido mandar el mensaje");
  }

  async getIncidenciasByUid(uid: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");
    const respIncidencias = await incidenciasCollection.find({ uid }).toArray();
    return respIncidencias;
  }

  async updateIncidenciaDestinatario(incidencias: Incidencias) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");

    const respIncidencias = await incidenciasCollection.updateOne(
      {
        _id: new ObjectId(incidencias._id),
      },
      {
        $set: {
          destinatario: incidencias.destinatario,
        },
      },
    );

    if (respIncidencias.acknowledged && respIncidencias.modifiedCount > 0)
      return true;
    throw Error("No se ha podido mandar el mensaje");
  }

  async deleteIncidencias(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const incidenciasCollection = db.collection<Incidencias>("incidencias");

    const resDelete = await incidenciasCollection.deleteOne({
      _id: new ObjectId(_id),
    });
    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }
}
