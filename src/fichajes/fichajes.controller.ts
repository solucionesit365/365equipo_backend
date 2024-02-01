import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
  Query,
  Body,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { Fichajes } from "./fichajes.class";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import { FirebaseService } from "../firebase/auth";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";
import { DateTime } from "luxon";

@Controller("fichajes")
export class FichajesController {
  constructor(
    private readonly authInstance: FirebaseService,
    private readonly tokenService: TokenService,
    private readonly fichajesInstance: Fichajes,
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}

  @Post("entrada")
  @UseGuards(AuthGuard)
  async entrada(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.nuevaEntrada(usuario),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("salida")
  @UseGuards(AuthGuard)
  async salida(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.nuevaSalida(usuario),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("estado")
  @UseGuards(AuthGuard)
  async getEstado(
    @Headers("authorization") authHeader: string,
    @Query("date") dateString: string,
  ) {
    try {
      const date = new Date(dateString);
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.getEstado(usuario.uid, date),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("sincroFichajes")
  @UseGuards(SchedulerGuard)
  async sincroFichajes() {
    try {
      await this.fichajesInstance.sincroFichajes();
      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("getFichajesHit")
  @UseGuards(SchedulerGuard)
  async getFichajesHit() {
    try {
      return {
        ok: true,
        data: await this.fichajesInstance.fusionarFichajesHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("fichajesByIdSql")
  @UseGuards(AuthGuard)
  async getFichajesByIdSql(
    @Query() { idSql, validado }: { idSql: number; validado: string },
  ) {
    try {
      if (!idSql && !validado) throw Error("Faltan parámetros");

      const validadoBoolean = validado == "true" ? true : false;

      const fichajes = await this.fichajesInstance.getFichajesByIdSql(
        Number(idSql),
        validadoBoolean,
      );

      return {
        ok: true,
        data: fichajes,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("updateFichaje")
  async updateFichaje(
    @Headers("authorization") authHeader: string,
    @Body() { id, validado },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      // const validadoBoolean = validado == 'true' ? true : false;
      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.
      const respFichaje = await this.fichajesInstance.updateFichaje(
        id,
        validado,
      );
      if (respFichaje)
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el fichaje");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("misFichajes")
  async getMisFichajes(
    @Headers("authorization") authHeader: string,
    @Query() { fechaInicio, fechaFinal },
  ) {
    try {
      if (!fechaInicio || !fechaFinal) throw Error("Faltan parámetros");

      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);

      fechaInicio = new Date(fechaInicio);
      fechaFinal = new Date(fechaFinal);

      return {
        ok: true,
        data: await this.fichajesInstance.getFichajesByUid(
          usuario.uid,
          fechaInicio,
          fechaFinal,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("sinValidar")
  async getSinValidar(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);
      const arraySubordinados = await this.trabajadoresInstance.getSubordinados(
        usuario.idApp,
      );

      return {
        ok: true,
        data: await this.fichajesInstance.getParesSinValidar(arraySubordinados),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("hayFichajesPendientes")
  @UseGuards(AuthGuard)
  async hayFichajesPendientes(
    @Body("arrayIds") arrayIds: number[],
    @Body("fecha", ParseDatePipe) fecha: Date,
  ) {
    return await this.fichajesInstance.hayFichajesPendientes(
      arrayIds,
      DateTime.fromJSDate(fecha),
    );
  }

  @Post("validarFichajesAntiguos")
  // @UseGuards(SchedulerGuard)
  async validarFichajesAntiguos() {
    return await this.fichajesInstance.validarFichajesAntiguos();
  }
}
