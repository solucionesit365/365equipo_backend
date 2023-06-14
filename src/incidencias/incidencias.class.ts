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


}
