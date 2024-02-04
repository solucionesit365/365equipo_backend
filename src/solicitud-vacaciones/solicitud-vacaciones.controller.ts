import { Controller, Get, Query, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { SolicitudesVacacionesService } from "./solicitud-vacaciones.class";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailService } from "src/email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";

@Controller("solicitud-vacaciones")
export class SolicitudVacacionesController {
  constructor(
    private readonly solicitudVacacionesInstance: SolicitudesVacacionesService,
    private readonly notificaciones: Notificaciones,
    private readonly email: EmailService,
    private readonly trabajadorInstance: TrabajadorService,
  ) {}

  //Nueva solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("nuevaSolicitud")
  async nuevaSolicitudVacaciones(
    @Body() solicitudesVacaciones: SolicitudVacaciones,
  ) {
    try {
      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(solicitudesVacaciones.idBeneficiario),
        );
      this.email.enviarEmail(
        solicitudTrabajador.emails,
        `Tu solicitud ha sido enviada con estos datos: <br/> 
        <table>
        <tr style="background-color:#0000ff ">
          <th>Fecha Inicio</th>
          <th>Fecha Final</th>
          <th>Fecha Incorporación</th>
          <th>Observación</th>
          <th>Total de días</th>
        </tr>
        <tr>
          
          <td>${solicitudesVacaciones.fechaInicio}</td>
          <td>${solicitudesVacaciones.fechaFinal}</td>
          <td>${solicitudesVacaciones.fechaIncorporacion}</td>
          <td>${solicitudesVacaciones.observaciones}</td>
          <td>${solicitudesVacaciones.totalDias}</td>
        </tr>
      </table>
       `,
        "Solicitud de Vacaciones",
      );

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
  @UseGuards(AuthGuard)
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
  @Get("solicitudesSubordinados")
  async solicitudesSubordinados(@Query() { idAppResponsable, year }) {
    try {
      if (!idAppResponsable) throw Error("Faltan datos");

      const solicitudesEmpleadosDirectos =
        await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
          idAppResponsable,
          Number(year),
        );
      const empleadosTipoCoordi =
        await this.trabajadorInstance.getSubordinadosConTienda(
          idAppResponsable,
        );
      const soyCoordinadora: boolean =
        await this.trabajadorInstance.esCoordinadora(idAppResponsable);
      const addArray = [];

      if (empleadosTipoCoordi.length > 0) {
        for (let i = 0; i < empleadosTipoCoordi.length; i++) {
          if (empleadosTipoCoordi[i].llevaEquipo) {
            // Caso coordinadora
            const solicitudesSubordinadosCoordinadora =
              await this.solicitudVacacionesInstance.getsolicitudesSubordinados(
                empleadosTipoCoordi[i].idApp,
                Number(year),
              );

            if (solicitudesSubordinadosCoordinadora.length > 0) {
              for (
                let j = 0;
                j < solicitudesSubordinadosCoordinadora.length;
                j++
              ) {
                solicitudesSubordinadosCoordinadora[j]["validador"] =
                  idAppResponsable;
              }
              addArray.push(...solicitudesSubordinadosCoordinadora);
            }
          }
        }
      }

      if (soyCoordinadora) {
        for (let i = 0; i < addArray.length; i++) {
          addArray[i]["validador"] = idAppResponsable;
        }

        for (let i = 0; i < solicitudesEmpleadosDirectos.length; i++) {
          solicitudesEmpleadosDirectos[i]["validador"] = idAppResponsable;
        }
      }

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
  async borrarSolicitud(@Body() { _id }: { _id: string }) {
    try {
      await this.solicitudVacacionesInstance.borrarSolicitud(_id);

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
        this.notificaciones.newInAppNotification({
          uid: solicitudTrabajador.idApp,
          titulo: "Vacaciones",
          mensaje: `Tus vacaciones han sido ${solicitud.estado}S`,
          leido: false,
          creador: "SISTEMA",
          url: "/mis-vacaciones",
        });

        this.email.enviarEmail(
          solicitudTrabajador.emails,
          `Tus vacaciones han sido: ${solicitud.estado}S <br/> Motivo: ${solicitud.respuestaSolicitud} `,
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
        data: await this.solicitudVacacionesInstance.sendToHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
