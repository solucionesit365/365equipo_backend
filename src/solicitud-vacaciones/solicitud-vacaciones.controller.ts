import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { SolicitudesVacacionesService } from "./solicitud-vacaciones.class";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { LoggerService } from "../logger/logger.service";
import { CompleteUser } from "src/decorators/getCompleteUser.decorator";
import { Trabajador } from "@prisma/client";

@Controller("solicitud-vacaciones")
export class SolicitudVacacionesController {
  constructor(
    private readonly solicitudVacacionesInstance: SolicitudesVacacionesService,
    private readonly email: EmailService,
    private readonly trabajadorInstance: TrabajadorService,
    private readonly notificacionesInstance: Notificaciones,
    private readonly loggerService: LoggerService,
  ) {}

  //Nueva solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("nuevaSolicitud")
  async nuevaSolicitudVacaciones(
    @Body() solicitudesVacaciones: SolicitudVacaciones,
    @CompleteUser() user: Trabajador,
  ) {
    try {
      const idBeneficiario =
        typeof solicitudesVacaciones.idBeneficiario === "object" &&
        solicitudesVacaciones.idBeneficiario !== null &&
        (solicitudesVacaciones.idBeneficiario as { id?: any })?.id !== undefined
          ? (solicitudesVacaciones.idBeneficiario as { id: any }).id
          : solicitudesVacaciones.idBeneficiario;

      if (!idBeneficiario) {
        throw new InternalServerErrorException("idBeneficiario no definido");
      }
      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(idBeneficiario),
        );

      this.email.enviarEmail(
        solicitudTrabajador.emails,
        `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #4a4a4a;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          }
          h2 {
            color: #0047ab;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            border: 1px solid #000000;
          }
          th {
            background-color: #0047ab;
            color: #ffffff;
            padding: 10px;
            text-align: center;
          }
          td {
            background-color: #ffffff;
            color: #000000;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #dddddd;
            
          }
          .highlight {
            background-color: #e7f4ff;
          }
          th, td {
            border: 1px solid #000000;
          }
          p{
            color: #000000;
          }
        </style>
      </head>
      <body>
        <h2>Solicitud de Vacaciones</h2>
        <p>Tu solicitud ha sido enviada con estos datos:</p>
        <table>
          <thead>
            <tr>
              <th>Fecha Inicio</th>
              <th>Fecha Final</th>
              <th>Fecha Incorporación</th>
              <th>Observación</th>
              <th>Total de días</th>
            </tr>
          </thead>
          <tbody>
            <tr class="highlight">
              <td>${solicitudesVacaciones.fechaInicio}</td>
              <td>${solicitudesVacaciones.fechaFinal}</td>
              <td>${solicitudesVacaciones.fechaIncorporacion}</td>
              <td>${solicitudesVacaciones.observaciones}</td>
              <td>${solicitudesVacaciones.totalDias}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`,
        "Confirmación de Solicitud de Vacaciones",
      );

      //enviar notificacion
      //get TokenFCM
      const userToken = await this.notificacionesInstance.getFCMToken(
        solicitudTrabajador.idApp,
      );

      if (userToken) {
        //enviar notificacion
        await this.notificacionesInstance.sendNotificationToDevice(
          userToken.token,
          "Solicitud de vacaciones",
          "Se ha creado una solicitud de vacaciones a tu nombre.",
          "/mis-vacaciones",
        );
      }

      this.loggerService.create({
        action: "Nueva solicitud de vacaciones",
        name: `Creado por ${user.nombreApellidos} para ${solicitudTrabajador.nombreApellidos}`,
      });

      return {
        ok: true,
        data: await this.solicitudVacacionesInstance.nuevaSolicitudVacaciones(
          solicitudesVacaciones,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  // @UseGuards(AuthGuard)
  @Get("getSolicitudes")
  async getSolicitudes(@Query() { year }) {
    try {
      return {
        ok: true,
        data: await this.solicitudVacacionesInstance.getSolicitudes(
          Number(year),
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  //Mostrar todas las solciitudes de vacaciones por tiendas
  @UseGuards(AuthGuard)
  @Get("getVacacionesByTiendas")
  async getVacacionesByTiendas(@Query() { tienda }) {
    try {
      const resVacacionesByTienda =
        await this.solicitudVacacionesInstance.getVacacionesByTiendas(tienda);
      return {
        ok: true,
        data: resVacacionesByTienda,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar todas las solcitudes de vacaciones por estados
  @UseGuards(AuthGuard)
  @Get("getVacacionesByEstado")
  async getVacacionesByEstado(@Query() { estado }) {
    try {
      const resVacacionesByEstado =
        await this.solicitudVacacionesInstance.getVacacionesByEstado(estado);
      return {
        ok: true,
        data: resVacacionesByEstado,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  @UseGuards(AuthGuard)
  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajadorSqlId(@Query() { idBeneficiario, year }) {
    try {
      if (idBeneficiario) {
        return {
          ok: true,
          data: await this.solicitudVacacionesInstance.getSolicitudesTrabajadorSqlId(
            Number(idBeneficiario),
            Number(year),
          ),
        };
      } else throw Error("Faltan datos. id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar solicitudes de vacaciones de los subordinados
  @UseGuards(AuthGuard)
  // @Get("solicitudesSubordinados")
  // async solicitudesSubordinados(@Query() { idAppResponsable, year }) {
  //   try {
  //     if (!idAppResponsable) throw Error("Faltan datos");

  //     const solicitudesEmpleadosDirectos =
  //       await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
  //         idAppResponsable,
  //         Number(year),
  //       );
  //     const empleadosTipoCoordi =
  //       await this.trabajadorInstance.getSubordinadosConTienda(
  //         idAppResponsable,
  //       );
  //     const soyCoordinadora: boolean =
  //       await this.trabajadorInstance.esCoordinadora(idAppResponsable);
  //     const addArray = [];

  //     if (empleadosTipoCoordi.length > 0) {
  //       for (let i = 0; i < empleadosTipoCoordi.length; i++) {
  //         if (empleadosTipoCoordi[i].llevaEquipo) {
  //           // Caso coordinadora
  //           const solicitudesSubordinadosCoordinadora =
  //             await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
  //               empleadosTipoCoordi[i].idApp,
  //               Number(year),
  //             );

  //           if (solicitudesSubordinadosCoordinadora.length > 0) {
  //             for (
  //               let j = 0;
  //               j < solicitudesSubordinadosCoordinadora.length;
  //               j++
  //             ) {
  //               solicitudesSubordinadosCoordinadora[j]["validador"] =
  //                 idAppResponsable;
  //             }
  //             addArray.push(...solicitudesSubordinadosCoordinadora);
  //           }
  //         }
  //       }
  //     }

  //     if (soyCoordinadora) {
  //       for (let i = 0; i < addArray.length; i++) {
  //         addArray[i]["validador"] = idAppResponsable;
  //       }

  //       for (let i = 0; i < solicitudesEmpleadosDirectos.length; i++) {
  //         solicitudesEmpleadosDirectos[i]["validador"] = idAppResponsable;
  //       }
  //     }

  //     if (solicitudesEmpleadosDirectos.length > 0) {
  //       solicitudesEmpleadosDirectos.push(...addArray);
  //       return { ok: true, data: solicitudesEmpleadosDirectos };
  //     } else if (addArray.length > 0) {
  //       return { ok: true, data: addArray };
  //     } else return { ok: true, data: [] };
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }
  @UseGuards(AuthGuard)
  @Get("solicitudesSubordinados")
  async solicitudesSubordinados(@Query() { idAppResponsable, year }) {
    try {
      if (!idAppResponsable) throw Error("Faltan datos");

      //  Consultar si la persona logueada es coordinadora (A o B)
      const soyCoordinadora =
        await this.trabajadorInstance.esCoordinadora(idAppResponsable);

      // Si la persona logueada es la coordinadora B, obtenemos el idAppResponsable de la A
      const idAppResponsableFinal = soyCoordinadora
        ? idAppResponsable
        : await this.trabajadorInstance.esCoordinadora(idAppResponsable);

      // Obtener solicitudes de vacaciones de los subordinados
      const solicitudesEmpleadosDirectos =
        await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
          idAppResponsableFinal,
          Number(year),
        );

      // Obtener subordinados de la coordinadora (A o B)
      const empleadosTipoCoordi =
        await this.trabajadorInstance.getSubordinadosConTienda(
          idAppResponsableFinal,
        );

      const addArray = [];

      //  Obtener solicitudes de subordinados adicionales (si los hay)
      if (empleadosTipoCoordi.length > 0) {
        for (let i = 0; i < empleadosTipoCoordi.length; i++) {
          if (empleadosTipoCoordi[i].llevaEquipo) {
            // Caso coordinadora A (si hay subordinados de otra coordinadora)
            const solicitudesSubordinadosCoordinadora =
              await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
                empleadosTipoCoordi[i].idApp, // id del subordinado
                Number(year),
              );

            if (solicitudesSubordinadosCoordinadora.length > 0) {
              solicitudesSubordinadosCoordinadora.forEach((solicitud: any) => {
                solicitud.validador = idAppResponsableFinal;
              });
              addArray.push(...solicitudesSubordinadosCoordinadora);
            }
          }
        }
      }

      //  Combinar solicitudes de subordinados directos y los subordinados adicionales
      if (solicitudesEmpleadosDirectos.length > 0) {
        solicitudesEmpleadosDirectos.push(...addArray);
        return { ok: true, data: solicitudesEmpleadosDirectos };
      } else if (addArray.length > 0) {
        return { ok: true, data: addArray };
      } else return { ok: true, data: [] };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Borrar solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("borrarSolicitud")
  async borrarSolicitud(
    @Body() { _id }: { _id: string },
    @User() user: UserRecord,
  ) {
    try {
      const solicitudEliminada =
        await this.solicitudVacacionesInstance.getSolicitudesById(_id);
      if (!solicitudEliminada) {
        throw new Error("Solicitud no encontrada");
      }

      await this.solicitudVacacionesInstance.borrarSolicitud(_id);

      // Obtener el nombre del usuario autenticado
      const usuarioCompleto =
        await this.trabajadorInstance.getTrabajadorByAppId(user.uid);
      const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

      // Registrar la auditoría con la solicitud eliminada
      await this.loggerService.create({
        action: "Eliminar Solicitud de Vacaciones",
        name: nombreUsuario,
        extraData: { solicitudEliminada },
      });

      return {
        ok: true,
        data: "Solicitud borrada con exito",
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  //Enviar emmail
  @UseGuards(AuthGuard)
  @Post("enviarAlEmail")
  async enviarAlEmail(@Body() data) {
    try {
      return this.solicitudVacacionesInstance.enviarAlEmail(data);
    } catch (error) {
      return error;
    }
  }

  //Forzar envio de vacaciones al cuadrante
  @UseGuards(AuthGuard)
  @Post("enviarAlCuadrante")
  async ponerEnCuadrante(@Body() data) {
    return this.solicitudVacacionesInstance.ponerEnCuadrante(data);
  }

  //Actualizar estado de la solicitud de Vacaciones
  @UseGuards(AuthGuard)
  @Post("setEstadoSolicitud")
  async updateSolicitudVacacionesEstado(
    @Body() solicitudesVacaciones: SolicitudVacaciones,
  ) {
    try {
      if (!solicitudesVacaciones.estado || !solicitudesVacaciones._id)
        throw Error("Faltan datos");

      if (
        !(
          solicitudesVacaciones.estado === "APROBADA" ||
          solicitudesVacaciones.estado === "RECHAZADA"
        )
      )
        throw Error("Estado de solicitud incorrecto");

      const resEstado =
        await this.solicitudVacacionesInstance.updateSolicitudVacacionesEstado(
          solicitudesVacaciones,
        );
      if (resEstado) {
        const solicitud =
          await this.solicitudVacacionesInstance.getSolicitudesById(
            solicitudesVacaciones._id.toString(),
          );

        const solicitudTrabajador =
          await this.trabajadorInstance.getTrabajadorBySqlId(
            Number(solicitud.idBeneficiario),
          );

        const userToken = await this.notificacionesInstance.getFCMToken(
          solicitudTrabajador.idApp,
        );
        // Verificar que el token no sea nulo
        if (userToken && userToken.token) {
          //enviar notificacion
          await this.notificacionesInstance.sendNotificationToDevice(
            userToken.token,
            "Estado de vacaciones",
            `Tu solicitud de vacaciones ha sido ${solicitud.estado}.`,
            "/mis-vacaciones",
          );
        }

        this.email.enviarEmail(
          solicitudTrabajador.emails,
          `
            <div style="font-family: 'Arial', sans-serif; color: #333;">
              <p>Tus vacaciones han sido: <strong>${
                solicitud.estado
              }</strong></p>
              ${
                solicitud.respuestaSolicitud
                  ? `<p><strong>Motivo:</strong> ${solicitud.respuestaSolicitud}</p>`
                  : "Vacaciones"
              }
              <p>Esperamos que disfrutes de tu tiempo libre.</p>
              <p>Saludos cordiales,<br/>El equipo de 365</p>
            </div>
          `,
          "Estado de Vacaciones",
        );

        return {
          ok: true,
          data: "En desarrollo",
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("sendToHit")
  async pendientesEnvio() {
    try {
      return {
        ok: true,
        // data: await this.solicitudVacacionesInstance.sendToHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("NotificarVacacionesPendientesSupervisoras")
  async notificarVacacionesPendientesSupervisoras() {
    const year = new Date().getFullYear();

    // Obtener todos los trabajadores que son supervisoras y llevan equipo
    const supervisorasConEquipo =
      await this.trabajadorInstance.getTrabajadores();

    // Filtrar las supervisoras que llevan equipo
    const usuariosSupervisora = supervisorasConEquipo.filter(
      (usuario) =>
        usuario.roles.some((rol) => rol.name === "Supervisora") &&
        usuario.llevaEquipo,
    );

    // Mapeamos cada supervisora a una promesa que se encargará de enviar la notificación
    const notificacionesPromises = usuariosSupervisora.map(
      async (supervisora) => {
        // Obtener las solicitudes pendientes de subordinados de esta supervisora
        const solicitudesPendientes =
          await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
            supervisora.idApp,
            year,
          );

        // Filtrar las solicitudes que estén en estado 'PENDIENTE'
        const solicitudesPendientesFiltradas = solicitudesPendientes.filter(
          (solicitud) => solicitud.estado === "PENDIENTE",
        );

        if (solicitudesPendientesFiltradas.length > 0) {
          // Obtener el token de la supervisora para enviar la notificación
          const userToken = await this.notificacionesInstance.getFCMToken(
            supervisora.idApp,
          );

          // Si se encuentra el token, enviar la notificación
          if (userToken && userToken.token) {
            try {
              await this.notificacionesInstance.sendNotificationToDevice(
                userToken.token,
                "Vacaciones Pendientes",
                `Tienes solicitudes de vacaciones pendientes de aprobar.`,
                "/vacaciones",
              );
            } catch (error) {
              console.log(error);
            }
          }
        }
      },
    );

    // Ejecutar todas las promesas de notificación en paralelo
    await Promise.all(notificacionesPromises);

    return { ok: true, message: "Notificaciones enviadas correctamente" };
  }

  @UseGuards(AuthGuard)
  @Get("resumen")
  async getResumenVacaciones(@Query() { idSql, year }) {
    try {
      if (!idSql || !year) throw Error("Faltan datos.");

      // 🔹 Convertir `idSql` y `year` a `number`
      const idResponsable = parseInt(idSql, 10);
      const yearNumber = parseInt(year, 10);

      if (isNaN(idResponsable) || isNaN(yearNumber)) {
        throw new Error("idSql o year no son valores numéricos válidos.");
      }

      // 🔹 Obtener todas las dependientas y coordinadoras
      const supervisorasTienda =
        await this.trabajadorInstance.getSubordinadosByIdsql(idResponsable);

      const coordinadoras = [];
      for (const supervisora of supervisorasTienda) {
        const subCoordinadoras =
          await this.trabajadorInstance.getSubordinadosByIdsql(supervisora.id);
        coordinadoras.push(...subCoordinadoras);
      }

      const dependientas = [];
      for (const coordinadora of coordinadoras) {
        const subDependientas =
          await this.trabajadorInstance.getSubordinadosByIdsql(coordinadora.id);
        dependientas.push(...subDependientas);
      }

      const trabajadores = [...dependientas, ...coordinadoras];
      const idsTrabajadores = trabajadores.map((t) => t.id);

      // 🔹 Obtener solicitudes de vacaciones de todos los trabajadores en una sola consulta
      const solicitudes =
        await this.solicitudVacacionesInstance.getSolicitudesMultiplesTrabajadores(
          idsTrabajadores,
          yearNumber,
        );

      // 🔹 Organizar datos para el frontend
      const tiendasResumen = {};

      // 📌 Registrar trabajadores en `tiendasResumen`
      for (const trabajador of trabajadores) {
        const tiendaId = trabajador.idTienda || "Sin asignar";

        if (!tiendasResumen[tiendaId]) {
          tiendasResumen[tiendaId] = { solicitados: 0, trabajadores: [] };
        }

        tiendasResumen[tiendaId].trabajadores.push(trabajador);
      }

      // 📌 Registrar solicitudes en `tiendasResumen`, usando `idTienda` del trabajador
      for (const solicitud of solicitudes) {
        // Buscamos el trabajador correspondiente a la solicitud
        const trabajadorSolicitante = trabajadores.find(
          (t) => t.id === solicitud.idBeneficiario,
        );

        // Si el trabajador existe, usamos su `idTienda`
        const tiendaId = trabajadorSolicitante
          ? trabajadorSolicitante.idTienda
          : solicitud.tienda || "Sin asignar";

        if (!tiendasResumen[tiendaId]) {
          tiendasResumen[tiendaId] = { solicitados: 0, trabajadores: [] };
        }

        tiendasResumen[tiendaId].solicitados += solicitud.totalDias || 0;
      }

      return { ok: true, data: tiendasResumen };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }
}
