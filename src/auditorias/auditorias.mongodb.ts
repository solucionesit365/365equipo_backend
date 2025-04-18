import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import {
  AuditoriasInterface,
  AuditoriaRespuestas,
} from "./auditorias.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class AuditoriaDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaAuditoria(auditorias: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");

    const resInsert = await auditoriasCollection.insertOne(auditorias);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva auditoria");
  }

  async getAuditorias() {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection.find({}).toArray();

    return respAuditorias;
  }

  async getAuditoriasHabilitado(habilitado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection
      .find({ habilitado: habilitado })
      .toArray();

    return respAuditorias;
  }
  //Habilitar auditoria
  async updateHabilitarAuditoria(auditorias: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection.updateOne(
      {
        _id: new ObjectId(auditorias._id),
      },
      {
        $set: {
          habilitado: true,
        },
      },
    );

    if (respAuditorias.acknowledged && respAuditorias.modifiedCount > 0)
      return true;
    throw Error("No se ha podido habilitar la auditoria");
  }

  //Deshabilitar auditoria
  async updateDeshabilitarAuditoria(auditorias: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection.updateOne(
      {
        _id: new ObjectId(auditorias._id),
      },
      {
        $set: {
          habilitado: false,
        },
      },
    );

    if (respAuditorias.acknowledged && respAuditorias.modifiedCount > 0)
      return true;
    throw Error("No se ha podido deshabilitar la auditoria");
  }

  //Respuestas auditorias
  async respuestasAuditorias(auditorias: AuditoriaRespuestas) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection = db.collection<AuditoriaRespuestas>(
      "auditoriasRespuestas",
    );

    const resInsert = await auditoriasCollection.insertOne(auditorias);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido guardar la respuesta de la auditoria");
  }

  //Ver Respuestas AuditoriasService
  async getRespuestasAuditorias(idAuditoria: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection = db.collection<AuditoriaRespuestas>(
      "auditoriasRespuestas",
    );

    const respAuditorias = await auditoriasCollection
      .find({ idAuditoria: idAuditoria })
      .toArray();

    return respAuditorias;
  }

  //Mostrar auditorias por idTienda
  async getAuditoriasTienda(tienda: number, habilitado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection
      .find({ tienda, habilitado })
      .toArray();

    return respAuditorias;
  }

  async getAuditoriasTiendas(tienda: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection = db.collection<AuditoriaRespuestas>(
      "auditoriasRespuestas",
    );
    const respAuditorias = await auditoriasCollection
      .find({ tienda })
      .toArray();

    return respAuditorias;
  }

  //Borrar auditoria
  async deleteAuditoria(auditorias: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection.deleteOne({
      _id: new ObjectId(auditorias._id),
    });
    return respAuditorias.acknowledged && respAuditorias.deletedCount > 0;
  }

  //Update auditoria
  async updateAuditoria(auditoria: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");

    const respAuditorias = await auditoriasCollection.updateOne(
      {
        _id: new ObjectId(auditoria._id),
      },
      {
        $set: {
          tituloAuditoria: auditoria.tituloAuditoria,
          caducidad: auditoria.caducidad,
          descripcion: auditoria.descripcion,
          tienda: auditoria.tienda,
          categoria: auditoria.categoria,
          preguntas: auditoria.preguntas,
          preguntasDependientaA: auditoria.preguntasDependientaA,
          preguntasDependientaB_C: auditoria.preguntasDependientaB_C,
          preguntasResponsable: auditoria.preguntasResponsable,
        },
      },
    );

    return respAuditorias.acknowledged;
  }

  //Update Auditoria Respuestas
  async updateAuditoriaRespuestas(auditoria: AuditoriaRespuestas) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection = db.collection<AuditoriaRespuestas>(
      "auditoriasRespuestas",
    );

    const respAuditoria = await auditoriasCollection.updateOne(
      {
        _id: new ObjectId(auditoria._id),
      },
      {
        $set: {
          respuestasEvaluador: auditoria.respuestasEvaluador,
          evaluada: auditoria.evaluada,
        },
      },
    );
    return respAuditoria.acknowledged;
  }

  async getAuditoriasById(auditoria: AuditoriasInterface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<AuditoriasInterface>("auditorias");
    const respAuditorias = await auditoriasCollection
      .find({ _id: new ObjectId(auditoria._id) })
      .toArray();
    return respAuditorias;
  }
}
