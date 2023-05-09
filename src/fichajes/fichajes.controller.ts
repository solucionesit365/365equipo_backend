import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { getUserWithToken, verifyToken } from "../firebase/auth";
import { Fichajes } from "./fichajes.class";
import { SchedulerGuard } from "../scheduler/scheduler.guard";

@Controller("fichajes")
export class FichajesController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly fichajesInstance: Fichajes,
  ) {}

  @Post("entrada")
  @UseGuards(AuthGuard)
  async entrada(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.nuevaEntrada(usuario.uid),
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
      const usuario = await getUserWithToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.nuevaSalida(usuario.uid),
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
      const usuario = await getUserWithToken(token);

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
    @Headers("authorization") authHeader: string,
    @Query() { idSql }: { idSql: number },
  ) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      return {
        ok: true,
        data: await this.fichajesInstance.getFichajesByIdSql(idSql),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
