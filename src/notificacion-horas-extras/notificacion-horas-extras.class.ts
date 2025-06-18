import { Injectable } from "@nestjs/common";
import { NotificacionHorasExtrasMongoService } from "./notificacion-horas-extras.mongodb";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";

@Injectable()
export class NotificacionHorasExtrasClass {
  constructor(
    private readonly shNotificacionhorasExtras: NotificacionHorasExtrasMongoService,
  ) {}

  async createNotificacionHorasExtras(
    notificaciones: TNotificacionHorasExtras,
  ) {
    return await this.shNotificacionhorasExtras.createNotificacionHorasExtras(
      notificaciones,
    );
  }

  async getAllNotificacionesHorasExtras() {
    return await this.shNotificacionhorasExtras.getAllNotificacionesHorasExtras();
  }

  async getNotificacionHorasExtrasByIdSql(
    idSql: number,
    tiendasAsignadas: number[],
  ) {
    return await this.shNotificacionhorasExtras.getNotificacionHorasExtrasByIdSql(
      idSql,
      tiendasAsignadas,
    );
  }

  async updateNotificacionHorasExtrasRevision(
    id: string,
    horaExtraId: string,
    data: { revision?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificacionHorasExtrasRevision(
      id,
      horaExtraId,
      data,
    );
  }

  async updateNotificacionHorasExtrasApagar(
    id: string,
    horaExtraId: string,
    data: { apagar?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificacionHorasExtrasApagar(
      id,
      horaExtraId,
      data,
    );
  }

  async deleteNotificacionHorasExtras(idHorasExtras: string) {
    return await this.shNotificacionhorasExtras.deleteNotificacionHorasExtras(
      idHorasExtras,
    );
  }

  async updateNotificacionHorasExtras(
    id: string,
    horaExtraId: string,
    data: TNotificacionHorasExtras,
  ) {
    return await this.shNotificacionhorasExtras.updateNotificacionHorasExtras(
      id,
      horaExtraId,
      data,
    );
  }

  async updateComentarioHorasExtras(
    id: string,
    horaExtraId: string,
    comentario: {
      nombre: string;
      fechaRespuesta: string;
      mensaje: string;
    }[],
  ) {
    return await this.shNotificacionhorasExtras.updateComentarioHorasExtras(
      id,
      horaExtraId,
      comentario,
    );
  }

  async marcarComentariosComoLeidos(
    id: string,
    horaExtraId: string,
    usuarioId: string,
    fecha: string,
  ) {
    return await this.shNotificacionhorasExtras.marcarComentariosComoLeidos(
      id,
      horaExtraId,
      usuarioId,
      fecha,
    );
  }
  async validarDuplicadosHorasExtras(
    dniTrabajador: string,
    horasExtras: {
      tienda: string;
      fecha: string;
      horaInicio: string;
      horaFinal: string;
    }[],
  ) {
    return await this.shNotificacionhorasExtras.buscarCoincidenciasHorasExtras(
      dniTrabajador,
      horasExtras,
    );
  }
  async getNotificacionHorasExtrasById(id: string) {
    return await this.shNotificacionhorasExtras.getNotificacionHorasExtrasById(
      id,
    );
  }
}
