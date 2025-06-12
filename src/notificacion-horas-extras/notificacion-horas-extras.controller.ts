import { Controller, Post, Get, Body, UseGuards, Query } from "@nestjs/common";
import { NotificacionHorasExtrasClass } from "./notificacion-horas-extras.class";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";

@Controller("notificacion-horas-extras")
export class NotificacionHorasExtrasController {
  constructor(
    private readonly shNotificacionhorasExtras: NotificacionHorasExtrasClass,
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
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

  //Check de revision
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

  //Check de apagar
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
  @UseGuards(AuthGuard)
  @Post("deleteNotificacionHorasExtras")
  deleteNotificacionHorasExtras(@Body() { idHorasExtras }) {
    return this.shNotificacionhorasExtras.deleteNotificacionHorasExtras(
      idHorasExtras,
    );
  }
  @UseGuards(AuthGuard)
  @Post("updateNotificacionHorasExtras")
  updateNotificacionHorasExtras(
    @Body()
    body: {
      id: string;
      horaExtraId: string;
      data: TNotificacionHorasExtras;
    },
  ) {
    return this.shNotificacionhorasExtras.updateNotificacionHorasExtras(
      body.id,
      body.horaExtraId,
      body.data,
    );
  }
  @UseGuards(AuthGuard)
  @Post("updateNotificacionHorasExtrasComentario")
  async updateNotificacionHorasExtrasComentario(
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
    @User() user: UserRecord,
  ) {
    const result = this.shNotificacionhorasExtras.updateComentarioHorasExtras(
      body.id,
      body.horaExtraId,
      body.comentario?.map((c) => ({
        ...c,
        fechaRespuesta: new Date(c.fechaRespuesta).toISOString(),
      })),
    );

    const trabajadores = await this.trabajadores.getTrabajadores();
    const remitente = trabajadores.find((t) => t.idApp === user.uid);

    if (!remitente) {
      console.warn("Remitente no encontrado");
      return result;
    }

    const esRRHH_O_Admin = remitente.roles.some(
      (r) => r.name === "RRHH_Admin" || r.name === "Administracion",
    );

    let destinatarios: any[] = [];

    if (esRRHH_O_Admin) {
      const registro =
        await this.shNotificacionhorasExtras.getNotificacionHorasExtrasById(
          body.id,
        );
      const creador = trabajadores.find(
        (t) => t.id === registro.creadorIdsql && t.idApp !== user.uid,
      );
      if (creador) destinatarios.push(creador);
    } else {
      destinatarios = trabajadores.filter(
        (t) =>
          t.idApp !== user.uid &&
          (t.idApp === "tQjpDBpj3nOfefgmTSF3EximSFV2" ||
            t.idApp === "046wOvqPWpQeUQQEkY5SZXQkvJp2" ||
            t.idApp === "9DK8wj2ahUe6mMcjmui5LloOi5r2"),
      );
    }

    for (const d of destinatarios) {
      if (!d?.idApp) continue;

      const userToken = await this.notificaciones.getFCMToken(d.idApp);
      if (!userToken?.token) {
        console.warn("No se encontró FCM token para", d.displayName);
        continue;
      }

      const ultimoComentario = body.comentario?.[body.comentario.length - 1];
      const title = "Nuevo comentario en Horas Extras";
      const message = `${remitente.displayName} comentó: "${ultimoComentario?.mensaje}"`;
      let url = `/resumenHorasExtrasAdmin`;
      if (esRRHH_O_Admin) {
        const registro =
          await this.shNotificacionhorasExtras.getNotificacionHorasExtrasById(
            body.id,
          );
        if (d.id === registro.creadorIdsql) {
          url = `/notificacionhorasextras`;
        }
      }

      const response = await this.notificaciones.sendNotificationToDevice(
        userToken.token,
        title,
        message,
        url,
      );
      console.log(
        "Notificación enviada a",
        d.displayName,
        "Respuesta FCM:",
        response,
      );
    }

    return result;
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
  @Post("validarNotificacionesHorasExtrasDuplicadas")
  async validarNotificacionesHorasExtrasDuplicadas(
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
    return await this.shNotificacionhorasExtras.validarDuplicadosHorasExtras(
      body.dniTrabajador,
      body.horasExtras,
    );
  }
}
