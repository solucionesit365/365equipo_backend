import { Controller, Post, Get, Body, UseGuards, Query } from "@nestjs/common";
import { NotificarAmpliacionContratosClass } from "./notificar-ampliacion-contratos.class";
import { TNotificarAmpliacionContratos } from "./notificar-ampliacion-contratos.dto";
import { AuthGuard } from "../guards/auth.guard";
@Controller("notificar-ampliacion-contratos")
export class NotificarAmpliacionContratosController {
  constructor(
    private readonly shNotificacionhorasExtras: NotificarAmpliacionContratosClass,
  ) {}

  @UseGuards(AuthGuard)
  @Post("createNotificarAmpliacionContratos")
  createNotificarAmpliacionContratos(
    @Body() data: TNotificarAmpliacionContratos,
  ) {
    try {
      return this.shNotificacionhorasExtras.createNotificarAmpliacionContratos(
        data,
      );
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
  @Get("getAllNotificarAmpliacionContratos")
  getAllNotificarAmpliacionContratos() {
    try {
      return this.shNotificacionhorasExtras.getAllNotificarAmpliacionContratos();
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
  @Get("getNotificarAmpliacionContratosByIdSql")
  getNotificarAmpliacionContratosByIdSql(@Query() { idSql }) {
    try {
      return this.shNotificacionhorasExtras.getNotificarAmpliacionContratosByIdSql(
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

  //Check de revision
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionContratosAmpliacion")
  updateNotificarAmpliacionContratosAmpliacion(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      ampliacion?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosAmpliacion(
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

  //Check de apagar
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionCointratosVueltaJornada")
  updateNotificarAmpliacionCointratosVueltaJornada(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      vueltaJornada?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificarAmpliacionCointratosVueltaJornada(
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
  @UseGuards(AuthGuard)
  @Post("deleteNotificarAmpliacionContratos")
  deleteNotificarAmpliacionContratos(@Body() { idHorasExtras }) {
    return this.shNotificacionhorasExtras.deleteNotificarAmpliacionContratos(
      idHorasExtras,
    );
  }
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionContratos")
  updateNotificarAmpliacionContratos(
    @Body()
    body: {
      id: string;
      horaExtraId: string;
      data: TNotificarAmpliacionContratos;
    },
  ) {
    return this.shNotificacionhorasExtras.updateNotificarAmpliacionContratos(
      body.id,
      body.horaExtraId,
      body.data,
    );
  }

  @UseGuards(AuthGuard)
  @Post("updateComentarioNotificarAmpliacionContratos")
  updateComentarioNotificarAmpliacionContratos(
    @Body()
    body: {
      id: string;
      horaExtraId: string;
      comentario?: {
        fechaRespuesta: Date;
        mensaje: string;
        nombre: string;
      }[];
    },
  ) {
    return this.shNotificacionhorasExtras.updateComentarioNotificarAmpliacionContratos(
      body.id,
      body.horaExtraId,
      body.comentario?.map((c) => ({
        ...c,
        fechaRespuesta: new Date(c.fechaRespuesta).toISOString(),
      })),
    );
  }
  @Post("updateUltimoLeido")
  async marcarLeido(
    @Body()
    body: {
      id: string;
      horaExtraId: string;
      usuarioId: string;
      fecha: string;
    },
  ) {
    return await this.shNotificacionhorasExtras.marcarComentariosComoLeidos(
      body.id,
      body.horaExtraId,
      body.usuarioId,
      body.fecha,
    );
  }

  @UseGuards(AuthGuard)
  @Post("validarNotificarAmpliacionContratos")
  async validarNotificarAmpliacionContratos(
    @Body()
    body: {
      dniTrabajador: string;
      horasExtras: {
        tienda: string;
        fecha: string;
        horaInicio: string;
        horaFinal: string;
      }[];
    },
  ) {
    return await this.shNotificacionhorasExtras.validarDuplicadosAmpliacionContratos(
      body.dniTrabajador,
      body.horasExtras,
    );
  }
}
