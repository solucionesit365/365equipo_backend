import {
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
  Post,
  Body,
} from "@nestjs/common";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import { verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { trabajadorInstance } from "./trabajadores.class";
import { FirebaseMessagingService } from "../firebase/firebase-messaging.service";

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly messagingService: FirebaseMessagingService,
  ) {}

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

      if (!uid) throw Error("Faltan datos");

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
  @UseGuards(SchedulerGuard)
  async sincronizarConHit() {
    try {
      return {
        ok: true,
        data: await trabajadorInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("suscribirseMessaging")
  async suscribirseMessaging(@Body() { token }) {
    try {
      if (!token) throw Error("Faltan parámetros");
      return {
        ok: true,
        data: await this.messagingService.subscribeToTopic(token),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
