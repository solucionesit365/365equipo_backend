import { Controller, Post, Get, Body, UseGuards, Query } from "@nestjs/common";
import { NotificacionHorasExtrasClass } from "./notificacion-horas-extras.class";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("notificacion-horas-extras")
export class NotificacionHorasExtrasController {
  constructor(
    private readonly shNotificacionhorasExtras: NotificacionHorasExtrasClass,
  ) {}

  @UseGuards(AuthGuard)
  @Post("createNotificacionHorasExtras")
  createNotificacionHorasExtras(@Body() data: TNotificacionHorasExtras) {
    try {
      return this.shNotificacionhorasExtras.createNotificacionHorasExtras(data);
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message: "Error al crear la notificacion de horas extras",
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllNotificacionesHorasExtras")
  getAllNotificacionesHorasExtras() {
    try {
      return this.shNotificacionhorasExtras.getAllNotificacionesHorasExtras();
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message: "Error al obtener todas las notificaciones de horas extras",
        error: error.message,
      };
    }
  }
  @UseGuards(AuthGuard)
  @Get("getNotificacionHorasExtrasByIdSql")
  getNotificacionHorasExtrasByIdSql(@Query() { idSql }) {
    try {
      // console.log(idSql)

      return this.shNotificacionhorasExtras.getNotificacionHorasExtrasByIdSql(
        Number(idSql),
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message: "Error al obtener notificaciones de horas extras",
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateNotificacionHorasExtrasRevision")
  updateNotificacionHorasExtrasRevision(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      revision?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificacionHorasExtrasRevision(
        data.id,
        data.horaExtraId,
        data,
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message:
          "Error al actualizar la notificacion de horas extras a revisar",
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateNotificacionHorasExtrasApagar")
  updateNotificacionHorasExtrasApagar(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      apagar?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificacionHorasExtrasApagar(
        data.id,
        data.horaExtraId,
        data,
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message: "Error al actualizar la notificacion de horas extras a pagar",
        error: error.message,
      };
    }
  }
}
