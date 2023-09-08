import {
  Controller,
  Get,
  Query,
  Headers,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { solicitudesVacacionesClass } from "./solicitud-vacaciones.class";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailClass } from "src/email/email.class";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";

@Controller("solicitud-vacaciones")
export class SolicitudVacacionesController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly solicitudVacacionesInstance: solicitudesVacacionesClass,
    private readonly notificaciones: Notificaciones,
    private readonly email: EmailClass,
    private readonly trabajadorInstance: Trabajador,
  ) {}

  //Nueva solicitud de vacaciones
  @Post("nuevaSolicitud")
  @UseGuards(AuthGuard)
  async nuevaSolicitudVacaciones(
    @Headers("authorization") authHeader: string,
    @Body() solicitudesVacaciones: SolicitudVacaciones,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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
  @Get("getSolicitudes")
  async getSolicitudes(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.solicitudVacacionesInstance.getSolicitudes(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajadorSqlId(
    @Headers("authorization") authHeader: string,
    @Query() { idBeneficiario },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      console.log(idBeneficiario);

      if (idBeneficiario) {
        return {
          ok: true,
          data: await this.solicitudVacacionesInstance.getSolicitudesTrabajadorSqlId(
            Number(idBeneficiario),
          ),
        };
      } else throw Error("Faltan datos. id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Borrar solicitud de vacaciones
  @Post("borrarSolicitud")
  async borrarSolicitud(
    @Headers("authorization") authHeader: string,
    @Query() { _id }: { _id: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      console.log(_id);

      const respSolicitudes =
        await this.solicitudVacacionesInstance.borrarSolicitud(_id);
      if (respSolicitudes)
        return {
          ok: true,
          data: respSolicitudes,
        };

      throw Error("No se ha podido borrar la solcitud");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  //Enviar emmail
  @Post("enviarAlEmail")
  async enviarAlEmail(
    @Headers("authorization") authHeader: string,
    @Body() data,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      return this.solicitudVacacionesInstance.enviarAlEmail(data);
    } catch (error) {
      return error;
    }
  }

  //Actualizar estado de la solicitud de Vacaciones
  @Post("setEstadoSolicitud")
  async updateSolicitudVacacionesEstado(
    @Headers("authorization") authHeader: string,
    @Body() solicitudesVacaciones: SolicitudVacaciones,
  ) {
    try {
      console.log(solicitudesVacaciones);

      if (!solicitudesVacaciones.estado) throw Error("Estado no proporcionado");

      if (!solicitudesVacaciones._id) throw Error("ID no proporcionado");

      if (!solicitudesVacaciones._id.toString())
        throw Error("ID no tiene un formato válido");

      if (
        !(
          solicitudesVacaciones.estado === "APROBADA" ||
          solicitudesVacaciones.estado === "RECHAZADA"
        )
      )
        throw Error("Estado de solicitud incorrecto");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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
}
