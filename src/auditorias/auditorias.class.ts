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

    async getAuditoriasHabilitado(habilitado: boolean) {
        return await this.schAuditorias.getAuditoriasHabilitado(habilitado);
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

    //Ver Respuestas Auditorias
    async getRespuestasAuditorias(idAuditoria: string) {
        return await this.schAuditorias.getRespuestasAuditorias(idAuditoria);

    }

    //Mostrar auditorias por idTienda
    async getAuditoriasTienda(tienda: number, habilitado: boolean) {
        return await this.schAuditorias.getAuditoriasTienda(tienda, habilitado);
    }

    //Borrar auditoria
    async deleteAuditoria(auditorias: AuditoriasInterface) {
        return await this.schAuditorias.deleteAuditoria(auditorias);
    }

    //Update Auditoria
    async updateAuditoria(auditorias: AuditoriasInterface) {
        return await this.schAuditorias.updateAuditoria(auditorias);
    }


    //Update Auditoria Respuestas
    async updateAuditoriaRespuestas(auditorias: AuditoriaRespuestas) {
        return await this.schAuditorias.updateAuditoriaRespuestas(auditorias);
    }
}
