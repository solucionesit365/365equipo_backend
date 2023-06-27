import { Injectable } from "@nestjs/common";
import { AuditoriasInterface } from "./auditorias.interface"
import { AuditoriaDatabase } from "./auditorias.mongodb";
import * as moment from "moment";

@Injectable()
export class Auditorias {
    constructor(
        private readonly schAuditorias: AuditoriaDatabase,
    ) { }


    async nuevaAuditoria(auditoria: AuditoriasInterface) {
        const insertAuditoria = await this.schAuditorias.nuevaAuditoria(auditoria)
        if (insertAuditoria) return true;

        throw Error("No se ha podido insertar la auditoria");

    }

    async getAuditorias() {
        return await this.schAuditorias.getAuditorias();
    }

}
