import { Controller, Get, Headers, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/scheduler/scheduler.guard";
import { verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { trabajadorInstance } from "./trabajadores.class";

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getTrabajadores(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const arrayTrabajadores = await trabajadorInstance.getTrabajadores();

      return { ok: true, data: arrayTrabajadores };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getTrabajadorByAppId")
  async getTrabajadorByAppId(
    @Headers("authorization") authHeader: string,
    @Query() { uid },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const resUser = await trabajadorInstance.getTrabajadorByAppId(uid);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getTrabajadorBySqlId")
  async getTrabajadorBySqlId(
    @Headers("authorization") authHeader: string,
    @Query() { id },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const resUser = await trabajadorInstance.getTrabajadorBySqlId(id);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getSubordinados")
  async getSubordinados(
    @Headers("authorization") authHeader: string,
    @Query() { uid },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const resUser = await trabajadorInstance.getSubordinados(uid);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("actualizarTrabajadores")
  async actualizarTrabajadores(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      return {
        ok: true,
        data: await trabajadorInstance.descargarTrabajadoresHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("sincronizarConHit")
  @UseGuards(AuthGuard)
  async sincronizarConHit(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);

      if (token === process.env.SINCRO_TOKEN) {
        return {
          ok: true,
          data: await trabajadorInstance.sincronizarConHit(),
        };
      }
      throw Error("No tienes permiso para completar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
