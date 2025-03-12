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

  async getNotificacionHorasExtrasByIdSql(idSql: number) {
    return await this.shNotificacionhorasExtras.getNotificacionHorasExtrasByIdSql(
      idSql,
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
}
