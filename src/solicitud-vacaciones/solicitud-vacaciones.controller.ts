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

@Controller("solicitud-vacaciones")
export class SolicitudVacacionesController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly solicitudVacacionesInstance: solicitudesVacacionesClass,
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
}
