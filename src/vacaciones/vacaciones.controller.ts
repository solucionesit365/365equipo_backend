import {
  Controller,
  Get,
  Query,
  Headers,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import { TokenService } from "../get-token/get-token.service";
import { Vacaciones } from "./vacaciones.class";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { AuthService } from "../firebase/auth";
import { Notificaciones } from "src/notificaciones/notificaciones.class";

@Controller("vacaciones")
export class VacacionesController {
  constructor(
    private readonly notificaciones: Notificaciones,
    private readonly authInstance: AuthService,
    private readonly trabajadorInstance: Trabajador,
    private readonly tokenService: TokenService,
    private readonly vacacionesInstance: Vacaciones,
  ) { }

  @Get()
  async getSolicitudes(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      return {
        ok: true,
        data: await this.vacacionesInstance.getSolicitudes(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getVacacionesByTiendas")
  async getVacacionesByTiendas(@Headers("authorization") authHeader: string,
    @Query() { idTienda },) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(idTienda);

      const resVacacionesByTienda = await this.vacacionesInstance.getVacacionesByTiendas(Number(idTienda))
      return {
        ok: true,
        data: resVacacionesByTienda
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getVacacionesByEstado")
  async getVacacionesByEstado(@Headers("authorization") authHeader: string,
    @Query() { estado },) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(estado);

      const resVacacionesByEstado = await this.vacacionesInstance.getVacacionesByEstado(estado)
      return {
        ok: true,
        data: resVacacionesByEstado
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }


  @Get("sendToHit")
  @UseGuards(SchedulerGuard)
  async pendientesEnvio() {
    try {
      return {
        ok: true,
        data: await this.vacacionesInstance.sendToHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajador(
    @Headers("authorization") authHeader: string,
    @Query() { uid, id },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (uid) {
        return {
          ok: true,
          data: await this.vacacionesInstance.getSolicitudesTrabajadorUid(uid),
        };
      } else if (id) {
        return {
          ok: true,
          data: await this.vacacionesInstance.getSolicitudesTrabajadorSqlId(id),
        };
      } else throw Error("Faltan datos. uid o id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("borrarSolicitud")
  async borrarSolicitud(
    @Headers("authorization") authHeader: string,
    @Body() { idSolicitud },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: this.vacacionesInstance.borrarSolicitud(idSolicitud),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("solicitudesSubordinados")
  async solicitudesSubordinados(
    @Headers("authorization") authHeader: string,
    @Query() { idAppResponsable },
  ) {
    try {
      if (!idAppResponsable) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const solicitudesEmpleadosDirectos =
        await this.vacacionesInstance.getSolicitudesSubordinados(
          idAppResponsable,
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
          if (empleadosTipoCoordi[i].llevaEquipo > 0) {
            // Caso coordinadora
            const solicitudesSubordinadosCoordinadora =
              await this.vacacionesInstance.getSolicitudesSubordinados(
                empleadosTipoCoordi[i].idApp,
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

  @Post("setEstadoSolicitud")
  async setEstadoSolicitud(
    @Headers("authorization") authHeader: string,
    @Body() { estado, idSolicitud, respuesta },
  ) {
    try {
      if (!estado || !idSolicitud) throw Error("Faltan datos");
      if (!(estado === "APROBADA" || estado === "RECHAZADA"))
        throw Error("Estado de solicitud incorrecto");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const resEstado = await this.vacacionesInstance.setEstadoSolicitud(
        estado,
        idSolicitud,
        respuesta,
      )
      if (resEstado) {
        const solicitud = await this.vacacionesInstance.getSolicitudById(Number(idSolicitud))
        const solicitudTrabajador = await this.trabajadorInstance.getTrabajadorBySqlId(Number(solicitud.idBeneficiario));
        this.notificaciones.newInAppNotification({
          uid: solicitudTrabajador.idApp,
          titulo: "Vacaciones",
          mensaje: `Tus vacaciones han sido ${estado}S`,
          leido: false,
          creador: "SISTEMA",

        })


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

  @Post("nuevaSolicitud")
  async nuevaSolicitudVacaciones(
    @Headers("authorization") authHeader: string,
    @Body() data,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (
        data.idBeneficiario &&
        data.totalDias &&
        data.fechaInicial &&
        data.fechaFinal &&
        data.fechaIncorporacion &&
        data.observaciones
      ) {
        return {
          ok: true,
          data: await this.vacacionesInstance.nuevaSolicitudVacaciones({
            idBeneficiario: data.idBeneficiario,
            fechaInicial: data.fechaInicial,
            fechaFinal: data.fechaFinal,
            fechaIncorporacion: data.fechaIncorporacion,
            observaciones: data.observaciones,
            totalDias: data.totalDias,
          }),
        };
      } else throw Error("Faltan parámetros");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }


}
