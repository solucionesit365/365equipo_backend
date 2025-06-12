import { Injectable } from "@nestjs/common";
import { NotificarAmpliacionContratosMongoService } from "./notificar-ampliacion-contratos.mongodb";
import { TNotificarAmpliacionContratos } from "./notificar-ampliacion-contratos.dto";

@Injectable()
export class NotificarAmpliacionContratosClass {
  constructor(
    private readonly shNotificacionhorasExtras: NotificarAmpliacionContratosMongoService,
  ) {}

  async createNotificarAmpliacionContratos(
    notificaciones: TNotificarAmpliacionContratos,
  ) {
    return await this.shNotificacionhorasExtras.createNotificarAmpliacionContratos(
      notificaciones,
    );
  }

  async getAllNotificarAmpliacionContratos() {
    return await this.shNotificacionhorasExtras.getAllNotificarAmpliacionContratos();
  }

  async getNotificarAmpliacionContratosByIdSql(idSql: number) {
    return await this.shNotificacionhorasExtras.getNotificarAmpliacionContratosByIdSql(
      idSql,
    );
  }

  async updateNotificarAmpliacionContratosAmpliacion(
    id: string,
    horaExtraId: string,
    data: { ampliacion?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosAmpliacion(
      id,
      horaExtraId,
      data,
    );
  }

  async updateNotificarAmpliacionContratosVueltaJornada(
    id: string,
    horaExtraId: string,
    data: { vueltaJornada?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosVueltaJornada(
      id,
      horaExtraId,
      data,
    );
  }

  async updateNotificarAmpliacionContratosFirmaGuardado(
    id: string,
    horaExtraId: string,
    data: { firmaGuardado?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosFirmaGuardado(
      id,
      horaExtraId,
      data,
    );
  }

  async updateNotificarAmpliacionContratosEscritoEnviado(
    id: string,
    horaExtraId: string,
    data: { escritoEnviado?: boolean },
  ) {
    return await this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosEscritoEnviado(
      id,
      horaExtraId,
      data,
    );
  }

  async deleteNotificarAmpliacionContratos(idHorasExtras: string) {
    return await this.shNotificacionhorasExtras.deleteNotificarAmpliacionContratos(
      idHorasExtras,
    );
  }

  async updateNotificarAmpliacionContratos(
    id: string,
    horaExtraId: string,
    data: TNotificarAmpliacionContratos,
  ) {
    return await this.shNotificacionhorasExtras.updateNotificarAmpliacionContratos(
      id,
      horaExtraId,
      data,
    );
  }

  async updateComentarioNotificarAmpliacionContratos(
    id: string,
    horaExtraId: string,
    comentario: {
      nombre: string;
      fechaRespuesta: string;
      mensaje: string;
    }[],
  ) {
    return await this.shNotificacionhorasExtras.updateComentarioNotificarAmpliacionContratos(
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
  async validarDuplicadosAmpliacionContratos(
    dniTrabajador: string,
    horasExtras: {
      tienda: string;
      fecha: string;
      horaInicio: string;
      horaFinal: string;
    }[],
  ) {
    return await this.shNotificacionhorasExtras.buscarCoincidenciasAmpliacionContratos(
      dniTrabajador,
      horasExtras,
    );
  }
  async getNotificacionAmpliacionContratosById(id: string) {
    return await this.shNotificacionhorasExtras.getNotificacionAmpliacionContratosById(
      id,
    );
  }
}
