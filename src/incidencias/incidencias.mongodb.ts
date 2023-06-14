import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { Incidencias } from "./incidencias.interface";

@Injectable()
export class IncidenciasClass {
    constructor(private readonly mongoDbService: MongoDbService) { }

    async nuevaIncidencia(incidencias: Incidencias) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const nuevasIncidenciasCollection = db.collection<Incidencias>(
            "incidencias",
        );
        const resInsert = await nuevasIncidenciasCollection.insertOne(incidencias);
        if (resInsert.acknowledged) return resInsert.insertedId;
        throw Error(
            "No se ha podido insertar la incidencia",
        );
    }
}