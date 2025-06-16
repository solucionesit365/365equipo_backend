import { Controller, Post, Get, Body, UseGuards, Query } from "@nestjs/common";
import { NotificarAmpliacionContratosClass } from "./notificar-ampliacion-contratos.class";
import { TNotificarAmpliacionContratos } from "./notificar-ampliacion-contratos.dto";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";
import { SchedulerGuard } from "src/guards/scheduler.guard";
@Controller("notificar-ampliacion-contratos")
export class NotificarAmpliacionContratosController {
  constructor(
    private readonly shNotificacionhorasExtras: NotificarAmpliacionContratosClass,
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
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

  //Check de ampliacion
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
          "Error al actualizar la notificacion de ampliacion de contratos ampliacion",
        error: error.message,
      };
    }
  }

  //Check de vueltaJornada
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionContratosVueltaJornada")
  updateNotificarAmpliacionContratosVueltaJornada(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      vueltaJornada?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosVueltaJornada(
        data.id,
        data.horaExtraId,
        data,
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message:
          "Error al actualizar la notificacion de ampliacion de contratos vueltaJornada",
        error: error.message,
      };
    }
  }
  //Check de firma guardado
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionContratosFirmaGuardado")
  updateNotificarAmpliacionContratosFirmaGuardado(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      firmaGuardado?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosFirmaGuardado(
        data.id,
        data.horaExtraId,
        data,
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message:
          "Error al actualizar la notificacion de ampliacion de contratos firmaGuardado",
        error: error.message,
      };
    }
  }

  //Check de escrito enviado
  @UseGuards(AuthGuard)
  @Post("updateNotificarAmpliacionContratosEscritoEnviado")
  updateNotificarAmpliacionContratosEscritoEnviado(
    @Body()
    data: {
      id: string;
      horaExtraId: string;
      escritoEnviado?: boolean;
    },
  ) {
    try {
      return this.shNotificacionhorasExtras.updateNotificarAmpliacionContratosEscritoEnviado(
        data.id,
        data.horaExtraId,
        data,
      );
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message:
          "Error al actualizar la notificacion de ampliacion de contratos escritoEnviado",
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
  async updateComentarioNotificarAmpliacionContratos(
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
    const result =
      await this.shNotificacionhorasExtras.updateComentarioNotificarAmpliacionContratos(
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
      (r) => r.name === "RRHH_ADMIN" || r.name === "Administracion",
    );

    let destinatarios: any[] = [];

    if (esRRHH_O_Admin) {
      const registro =
        await this.shNotificacionhorasExtras.getNotificacionAmpliacionContratosById(
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
            t.idApp === "I712aJquPwQNsqiiZ2LvQeyMjPw1"),
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
      const title = "Nuevo comentario en Ampliación de Contratos";
      const message = `${remitente.displayName} comentó: "${ultimoComentario?.mensaje}"`;
      let url = `/resumenAmpliacionesContratos`;
      if (esRRHH_O_Admin) {
        const registro =
          await this.shNotificacionhorasExtras.getNotificacionAmpliacionContratosById(
            body.id,
          );
        if (d.id === registro.creadorIdsql) {
          url = `/notificarAmpliacionesContratos`;
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

  @UseGuards(SchedulerGuard)
  @Post("notificarCaducidadAmpliaciones")
  async notificarCaducidadAmpliaciones() {
    const notificaciones =
      await this.shNotificacionhorasExtras.getAllNotificarAmpliacionContratos();
    const hoy = DateTime.now().startOf("day");

    // IDs de RRHH_ADMIN (Katy, Ana, Jessi)
    const rrhhAdminsIds = [
      "046wOvqPWpQeUQQEkY5SZXQkvJp2", // Katy
      "I712aJquPwQNsqiiZ2LvQeyMjPw1", // Ana
      "0vnxV84558dqvlpIyZkygrW9ud62", // Jessi
    ];

    const trabajadores = await this.trabajadores.getTrabajadores();

    for (const notificacion of notificaciones) {
      for (const ampliacion of notificacion.ampliacionJornada || []) {
        // Verifica si la fecha fin ha caducado
        if (ampliacion.fechaFinAmpliacion) {
          const fechaFin = DateTime.fromFormat(
            ampliacion.fechaFinAmpliacion,
            "dd/MM/yyyy",
          ).startOf("day");

          const diasAntes = 5;
          const fechaLimite = hoy.plus({ days: diasAntes });

          if (fechaFin.isValid && fechaFin <= fechaLimite && fechaFin > hoy) {
            // Buscar supervisora (ajusta el campo según tu modelo)
            const supervisora = trabajadores.find(
              (t) =>
                t.id === notificacion.creadorIdsql &&
                t.roles?.some((r) => r.name === "Supervisora"),
            );

            // Buscar RRHH_ADMIN
            const rrhhAdmins = trabajadores.filter((t) =>
              rrhhAdminsIds.includes(t.idApp),
            );

            // Unir destinatarios y eliminar duplicados
            const destinatarios = [
              ...(supervisora ? [supervisora] : []),
              ...rrhhAdmins,
            ].filter(
              (v, i, a) => a.findIndex((t) => t.idApp === v.idApp) === i,
            );

            for (const d of destinatarios) {
              if (!d?.idApp) continue;
              const userToken = await this.notificaciones.getFCMToken(d.idApp);
              if (!userToken?.token) continue;

              // Determinar la URL según el rol
              let url = "/resumenAmpliacionesContratos";
              const esRRHH = d.roles?.some((r) => r.name === "RRHH_ADMIN");
              if (!esRRHH) {
                url = "/notificarAmpliacionesContratos";
              }

              const title = "Fin de ampliación/reducción temporal";
              const message = `La ampliación o reducción temporal para ${
                notificacion.trabajador || "un trabajador"
              } esta a punto de caducar.`;

              await this.notificaciones.sendNotificationToDevice(
                userToken.token,
                title,
                message,
                url,
              );
            }
          }
        }
      }
    }
  }
}
