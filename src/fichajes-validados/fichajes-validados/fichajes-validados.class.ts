import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { FichajesValidadosDatabase } from './fichajes-validados.mongodb'

@Injectable()
export class FichajesValidados {
    constructor(
        private readonly schFichajesValidados: FichajesValidadosDatabase,
    ) { }

    async addFichajesValidados(fichajeValidado: FichajeValidadoDto) {
        return await this.schFichajesValidados.insertarFichajeValidado(fichajeValidado)
    }
}
