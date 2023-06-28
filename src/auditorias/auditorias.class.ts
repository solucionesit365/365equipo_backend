import { Injectable } from "@nestjs/common";
import { AuditoriasInterface, AuditoriaRespuestas } from "./auditorias.interface"
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

    async updateHabilitarAuditoria(auditoria: AuditoriasInterface) {
        return await this.schAuditorias.updateHabilitarAuditoria(auditoria);
    }

    async updateDeshabilitarAuditoria(auditoria: AuditoriasInterface) {
        return await this.schAuditorias.updateDeshabilitarAuditoria(auditoria);
    }

    //Respuestas auditorias
    async respuestasAuditorias(auditoria: AuditoriaRespuestas) {
        const insertRespuestaAuditoria = await this.schAuditorias.respuestasAuditorias(auditoria)
        if (insertRespuestaAuditoria) return true;

        throw Error("No se ha podido guardar la respuesta de la auditoria");

    }

    async getRespuestasAuditorias(id: string) {
        return await this.schAuditorias.getRespuestasAuditorias(id);

    }

}
