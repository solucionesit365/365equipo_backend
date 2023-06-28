import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { AuditoriasInterface, AuditoriaRespuestas } from "./auditorias.interface"
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class AuditoriaDatabase {
    constructor(private readonly mongoDbService: MongoDbService) { }

    async nuevaAuditoria(auditorias: AuditoriasInterface) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriasInterface>("auditorias");

        const resInsert = await auditoriasCollection.insertOne(auditorias);

        if (resInsert.acknowledged) return resInsert.insertedId;

        throw Error("No se ha podido crear la nueva auditoria");
    }

    async getAuditorias() {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriasInterface>("auditorias");
        const respAuditorias = await auditoriasCollection.find({}).toArray();

        return respAuditorias;
    }

    //Habilitar auditoria
    async updateHabilitarAuditoria(auditorias: AuditoriasInterface) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriasInterface>("auditorias");
        const respAuditorias = await auditoriasCollection.updateOne(
            {
                _id: new ObjectId(auditorias._id),
            },
            {
                $set: {
                    habilitado: true,
                }
            },
        );

        if (respAuditorias.acknowledged && respAuditorias.modifiedCount > 0)
            return true;
        throw Error("No se ha podido habilitar la auditoria");
    }

    //Deshabilitar auditoria
    async updateDeshabilitarAuditoria(auditorias: AuditoriasInterface) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriasInterface>("auditorias");
        const respAuditorias = await auditoriasCollection.updateOne(
            {
                _id: new ObjectId(auditorias._id),
            },
            {
                $set: {
                    habilitado: false,
                }
            },
        );

        if (respAuditorias.acknowledged && respAuditorias.modifiedCount > 0)
            return true;
        throw Error("No se ha podido deshabilitar la auditoria");
    }


    //Respuestas auditorias
    async respuestasAuditorias(auditorias: AuditoriaRespuestas) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriaRespuestas>("auditoriasRespuestas");

        const resInsert = await auditoriasCollection.insertOne(auditorias);

        if (resInsert.acknowledged) return resInsert.insertedId;

        throw Error("No se ha podido guardar la respuesta de la auditoria");
    }


    //Ver Respuestas Auditorias
    async getRespuestasAuditorias(id: string) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const auditoriasCollection = db.collection<AuditoriaRespuestas>("auditoriasRespuestas");

        const respAuditorias = await auditoriasCollection.find({ id }).toArray();

        return respAuditorias;
    }


}