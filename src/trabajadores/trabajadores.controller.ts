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
import { TokenService } from "../get-token/get-token.service";
import { FirebaseMessagingService } from "../firebase/firebase-messaging.service";
import { Trabajador } from "./trabajadores.class";
import { AuthService } from "../firebase/auth";

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly trabajadorInstance: Trabajador,
    private readonly tokenService: TokenService,
    private readonly messagingService: FirebaseMessagingService,
  ) {}

  @Get()
  async getTrabajadores(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const arrayTrabajadores = await this.trabajadorInstance.getTrabajadores();

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
      await this.authInstance.verifyToken(token);

      const resUser = await this.trabajadorInstance.getTrabajadorByAppId(uid);
      // console.log(resUser);
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
      await this.authInstance.verifyToken(token);

      const resUser = await this.trabajadorInstance.getTrabajadorBySqlId(id);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("validarQR")
  async validarQRTrabajador(
    @Headers("authorization") authHeader: string,
    @Query() { idTrabajador, tokenQR },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (!idTrabajador && !tokenQR) throw Error("Faltan datos");
      const resUser = await this.trabajadorInstance.getTrabajadorTokenQR(
        Number(idTrabajador),
        tokenQR,
      );

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
      await this.authInstance.verifyToken(token);

      if (!uid) throw Error("Faltan datos");

      const resUser = await this.trabajadorInstance.getSubordinados(uid);

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
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.trabajadorInstance.descargarTrabajadoresHit(),
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
        data: await this.trabajadorInstance.sincronizarConHit(),
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

  @Post("registro")
  async registroUsuarios(@Body() { dni, password }) {
    try {
      if (!dni || !password || password < 6)
        throw Error("Algunos parámetros no son correctos");

      return {
        ok: true,
        data: await this.trabajadorInstance.registrarUsuario(dni, password),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
