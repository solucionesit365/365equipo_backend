import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { Incidencias } from "./incidencias.interface";

@Injectable()
export class IncidenciasClass {
    constructor(private readonly mongoDbService: MongoDbService) { }

    async nuevaIncidencia(incidencias: Incidencias) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const incidenciasCollection = db.collection<Incidencias>(
            "incidencias",
        );
        const resInsert = await incidenciasCollection.insertOne(incidencias);
        if (resInsert.acknowledged) return resInsert.insertedId;
        throw Error(
            "No se ha podido insertar la incidencia",
        );
    }

    async getIncidencias() {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const incidenciasCollection = db.collection<Incidencias>("incidencias");

        const respIncidencias = await incidenciasCollection.find({}).toArray();

        return respIncidencias;
    }

    async getIncidenciasByEstado(estado: string) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const incidenciasCollection = db.collection<Incidencias>("incidencias");
        const respIncidencias = await incidenciasCollection.find({ estado }).toArray();

        return respIncidencias;
    }
    async getIncidenciasByCategoria(categoria: string) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const incidenciasCollection = db.collection<Incidencias>("incidencias");
        const respIncidencias = await incidenciasCollection.find({ categoria }).toArray();

        return respIncidencias;
    }

    async getIncidenciasByPrioridad(prioridad: string) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const incidenciasCollection = db.collection<Incidencias>("incidencias");
        const respIncidencias = await incidenciasCollection.find({ prioridad }).toArray();

        return respIncidencias;
    }

    //cambiar estado
    // async updateIncidenciaEstado(uid: string, estado: string) {
    //     const db = (await this.mongoDbService.getConexion()).db("soluciones")
    //     const incidenciasCollection = db.collection<Incidencias>("incidencias");
    //     const respIncidencias = await incidenciasCollection.updateOne(
    //         {
    //             uid
    //         },
    //         {
    //             $set: estado ,
    //         },
    //     );

    //     if (respIncidencias.acknowledged && respIncidencias.modifiedCount > 0)
    //         return true;
    //     throw Error("No se ha podido marcar como no leída la notificación");
    // }

}