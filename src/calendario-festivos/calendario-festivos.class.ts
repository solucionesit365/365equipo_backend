import { Injectable } from "@nestjs/common";
import { CalendarioFestivosInterface } from "./calendario-festivos.interface";
import { CalendarioFestivosDatabase } from "./calendario-festivos.mongodb";
import * as moment from "moment";

@Injectable()
export class CalendarioFestivo {
    constructor(
        private readonly schCalendario: CalendarioFestivosDatabase,
    ) { }

    async nuevoFestivo(festivo: CalendarioFestivosInterface) {
        const insertAuditoria = await this.schCalendario.nuevoFestivo(festivo)
        if (insertAuditoria) return true;

        throw Error("No se ha podido insertar la auditoria");

    }

    async getfestivos() {
        return await this.schCalendario.getFestivos();
    }
}