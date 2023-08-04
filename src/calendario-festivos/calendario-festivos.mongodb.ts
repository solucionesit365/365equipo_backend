import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { CalendarioFestivosInterface } from "./calendario-festivos.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class CalendarioFestivosDatabase {
    constructor(private readonly mongoDbService: MongoDbService
    ) { }

    async nuevoFestivo(festivo: CalendarioFestivosInterface) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const calendarioCollection = db.collection<CalendarioFestivosInterface>("calendarioFestivos");

        const resInsert = await calendarioCollection.insertOne(festivo);

        if (resInsert.acknowledged) return resInsert.insertedId;

        throw Error("No se ha podido crear el nuevo festivo");
    }

    async getFestivos() {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const calendarioCollection = db.collection<CalendarioFestivosInterface>("calendarioFestivos");
        const respCalendario = await calendarioCollection.find({}).toArray();

        return respCalendario;
    }


    async getFestivosByTienda(tienda: number) {
        const db = (await this.mongoDbService.getConexion()).db("soluciones");
        const calendarioCollection = db.collection<CalendarioFestivosInterface>("calendarioFestivos");

        if (tienda) {
            return await calendarioCollection
                .find({ tienda: { $in: [tienda, -1] } })
                .toArray();
        }
        return await calendarioCollection.find({}).toArray();
    }

}

