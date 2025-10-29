import { Injectable } from "@nestjs/common";
import { IncidenciasDatabase } from "./incidencias.mongodb";
import { Incidencias, IncidenciasInvitado } from "./incidencias.interface";
import axios from "axios";
import { Tienda } from "src/tiendas/tiendas.class";

@Injectable()
export class Incidencia {
  constructor(private readonly schIncidencias: IncidenciasDatabase) {}

  async nuevaIncidencia(incidencia: Incidencias) {
    const insertIncidencia =
      await this.schIncidencias.nuevaIncidencia(incidencia);
    if (insertIncidencia) {
      axios.post(
        "https://default1a80919e07cb47fa91148a866d19a9.b8.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4caf9a2a73f34a249b1651fc94477822/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pfov2rPYEzeqmzUsGyjlE016vv79fomNYJ_l4rq2to0",
        {
          destinatario: incidencia.destinatario,
          descripcion: incidencia.descripcion,
          prioridad: incidencia.prioridad,
          nombre: incidencia.nombre,
          tienda: incidencia.tienda,
        },
      );
      return true;
    }
    throw Error("No se ha podido insertar la incidencia");
  }

  // incidenciaInvitado
  async nuevaIncidenciaInvitado(incidencia: IncidenciasInvitado) {
    const insertIncidencia =
      await this.schIncidencias.nuevaIncidenciaInvitado(incidencia);
    if (insertIncidencia) {
      axios.post(
        "https://default1a80919e07cb47fa91148a866d19a9.b8.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4caf9a2a73f34a249b1651fc94477822/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pfov2rPYEzeqmzUsGyjlE016vv79fomNYJ_l4rq2to0",
        {
          destinatario: incidencia.destinatario,
          descripcion: incidencia.descripcion,
          prioridad: incidencia.prioridad,
          nombre: incidencia.nombre,
          tienda: "Invitado",
        },
      );
      return true;
    }
    throw Error("No se ha podido insertar la incidencia");
  }
  async getIncidencias() {
    return await this.schIncidencias.getIncidencias();
  }

  async getIncidenciasRrhh() {
    return await this.schIncidencias.getIncidenciasRrhh();
  }

  async getIncidenciasByEstado(estado: string) {
    return await this.schIncidencias.getIncidenciasByEstado(estado);
  }

  async getIncidenciasEstadoRrhh(estado: string) {
    return await this.schIncidencias.getIncidenciasEstadoRrhh(estado);
  }

  async getIncidenciasByCategoria(categoria: string) {
    return await this.schIncidencias.getIncidenciasByCategoria(categoria);
  }

  async getIncidenciasByCategoriaRrhh(categoria: string) {
    return await this.schIncidencias.getIncidenciasByCategoriaRrhh(categoria);
  }

  async getIncidenciasByPrioridad(prioridad: string) {
    return await this.schIncidencias.getIncidenciasByPrioridad(prioridad);
  }

  async getIncidenciasByPrioridadRrhh(prioridad: string) {
    return await this.schIncidencias.getIncidenciasByPrioridadRrhh(prioridad);
  }

  async updateIncidenciaEstado(incidencias: Incidencias) {
    return await this.schIncidencias.updateIncidenciaEstado(incidencias);
  }

  async updateIncidenciaMensajes(incidencias: Incidencias) {
    return await this.schIncidencias.updateIncidenciaMensajes(incidencias);
  }

  async getIncidenciasByUid(uid: string) {
    return await this.schIncidencias.getIncidenciasByUid(uid);
  }

  async updateIncidenciaDestinatario(incidencias: Incidencias) {
    return await this.schIncidencias.updateIncidenciaDestinatario(incidencias);
  }

  async deleteIncidencias(_id: string) {
    return await this.schIncidencias.deleteIncidencias(_id);
  }
}
