import { Injectable } from "@nestjs/common";
import { IncidenciasClass } from "./incidencias.mongodb"
import { Incidencias } from "./incidencias.interface";


@Injectable()
export class Incidencia {
    constructor(
        private readonly schIncidencias: IncidenciasClass,
    ) { }

    async nuevaIncidencia(incidencia: Incidencias) {
        const insertIncidencia = await this.schIncidencias.nuevaIncidencia(incidencia)
        if (insertIncidencia) return true;

        throw Error("No se ha podido insertar la incidencia");

    }
    async getIncidencias() {
        return await this.schIncidencias.getIncidencias();
    }

    async getIncidenciasByEstado(estado: string) {
        return await this.schIncidencias.getIncidenciasByEstado(estado);
    }

    async getIncidenciasByCategoria(categoria: string) {
        return await this.schIncidencias.getIncidenciasByCategoria(categoria);
    }

    async getIncidenciasByPrioridad(prioridad: string) {
        return await this.schIncidencias.getIncidenciasByPrioridad(prioridad);
    }

    // async updateIncidenciaEstado(uid: string, estado: string) {
    //     return await this.schIncidencias.updateIncidenciaEstado(uid, estado);
    // }
}
