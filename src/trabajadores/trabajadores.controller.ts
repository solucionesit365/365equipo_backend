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
import { AdminGuard } from "../auth/admin.guard";

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
  async validarQRTrabajador(@Query() { idTrabajador, tokenQR }) {
    try {
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
        data: await this.trabajadorInstance.sincronizarConHit(),
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

  @Get("descargarHistoriaContratos")
  @UseGuards(SchedulerGuard)
  async descargarHistoriaContratos() {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.descargarHistoriaContratos(),
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

  @Post("guardarCambios")
  async guardarCambiosForm(
    @Headers("authorization") authHeader: string,
    @Body()
    { modificado, original },
  ) {
    try {
      // Falta comprobar parámetros de entrada
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const usuario = await this.authInstance.getUserWithToken(token);
      return {
        ok: true,
        data: await this.trabajadorInstance.guardarCambiosForm(
          original,
          usuario,
          modificado,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("arbolById")
  async getArbolById(
    @Headers("authorization") authHeader: string,
    @Query() { idSql }: { idSql: string },
  ) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.trabajadorInstance.getArbolById(Number(idSql)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("borrarTrabajador")
  @UseGuards(AdminGuard)
  async borrarTrabajador(@Body() { idSql }) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.borrarTrabajador(idSql),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAllCoordis")
  async getAllCoordis(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.trabajadorInstance.getCoordis(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
