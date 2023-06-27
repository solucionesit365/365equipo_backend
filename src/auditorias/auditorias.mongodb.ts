import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { AuditoriasInterface } from "./auditorias.interface"
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


}