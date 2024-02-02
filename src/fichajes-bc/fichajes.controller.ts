import { Controller, Post, UseGuards, Get, Query, Body } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { Fichajes } from "./fichajes.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";
import { DateTime } from "luxon";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";
import { SchedulerGuard } from "../guards/scheduler.guard";

@Controller("fichajes")
export class FichajesController {
  constructor(
    private readonly fichajesInstance: Fichajes,
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("entrada")
  async entrada(@User() user: DecodedIdToken) {
    try {
      return {
        ok: true,
        data: await this.fichajesInstance.nuevaEntrada(user.uid),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("salida")
  async salida(@User() user: DecodedIdToken) {
    try {
      return {
        ok: true,
        data: await this.fichajesInstance.nuevaSalida(user.uid),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("estado")
  async getEstado(
    @Query("date") dateString: string,
    @User() user: DecodedIdToken,
  ) {
    try {
      const date = new Date(dateString);

      return {
        ok: true,
        data: await this.fichajesInstance.getEstado(user.uid, date),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("sincroFichajes")
  async sincroFichajes() {
    try {
      const response = await this.fichajesInstance.sincroFichajes();
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("getFichajesHit")
  async getFichajesBC() {
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

  @UseGuards(AuthGuard)
  @Get("fichajesByIdSql")
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

  @UseGuards(AuthGuard)
  @Post("updateFichaje")
  async updateFichaje(@Body() { id, validado }) {
    try {
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

  @UseGuards(AuthGuard)
  @Get("misFichajes")
  async getMisFichajes(
    @User() user: DecodedIdToken,
    @Query() { fechaInicio, fechaFinal },
  ) {
    try {
      if (!fechaInicio || !fechaFinal) throw Error("Faltan parámetros");

      fechaInicio = new Date(fechaInicio);
      fechaFinal = new Date(fechaFinal);

      return {
        ok: true,
        data: await this.fichajesInstance.getFichajesByUid(
          user.uid,
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
  async getSinValidar(@User() user: DecodedIdToken) {
    try {
      const arraySubordinados = await this.trabajadoresInstance.getSubordinados(
        user.uid,
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

  @UseGuards(AuthGuard)
  @Post("hayFichajesPendientes")
  async hayFichajesPendientes(
    @Body("arrayIds") arrayIds: number[],
    @Body("fecha", ParseDatePipe) fecha: Date,
  ) {
    return await this.fichajesInstance.hayFichajesPendientes(
      arrayIds,
      DateTime.fromJSDate(fecha),
    );
  }
}
