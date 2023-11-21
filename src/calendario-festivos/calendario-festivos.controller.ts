import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
  Query,
} from "@nestjs/common";
import { CalendarioFestivo } from "./calendario-festivos.class";
import {
  CalendarioFestivosInterface,
  eventoNavideño,
} from "./calendario-festivos.interface";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";

@Controller("calendario-festivos")
export class CalendarioFestivosController {
  constructor(
    private readonly calendarioFestivosInstance: CalendarioFestivo,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post("nuevoFestivo")
  @UseGuards(AuthGuard)
  async nuevoFestivo(
    @Headers("authorization") authHeader: string,
    @Body() festivo: CalendarioFestivosInterface,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.calendarioFestivosInstance.nuevoFestivo(festivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getFestivos")
  @UseGuards(AuthGuard)
  async getFestivos(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respCalendario =
        await this.calendarioFestivosInstance.getfestivos();
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado ningun festivo");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getFestivosByTienda")
  @UseGuards(AuthGuard)
  async getFestivosByTienda(
    @Headers("authorization") authHeader: string,
    @Query() { tienda }: { tienda: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respCalendario =
        await this.calendarioFestivosInstance.getfestivosByTienda(
          Number(tienda),
        );
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado ningun festivo por tienda ");
    } catch (error) {
      console.log(error);
    }
  }
  //Notificacion navideña
  @Post("guardarRespuesta")
  @UseGuards(AuthGuard)
  async nuevoEvento(
    @Headers("authorization") authHeader: string,
    @Body() festivo: eventoNavideño,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      // Convertir fechaRespuesta de string a Date
      festivo.fechaRespuesta = new Date(festivo.fechaRespuesta);

      return {
        ok: true,
        data: await this.calendarioFestivosInstance.nuevoEvento(festivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("verificarRespuesta")
  @UseGuards(AuthGuard)
  async verificacionRespuesta(
    @Headers("authorization") authHeader: string,
    @Query() { idUsuario }: { idUsuario: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const haRespondido =
        await this.calendarioFestivosInstance.verificacionRespuesta(
          Number(idUsuario),
        );

      return { ok: true, haRespondido: haRespondido }; // Indica si el usuario ha respondido
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getEventos")
  @UseGuards(AuthGuard)
  async getEventos(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respCalendario = await this.calendarioFestivosInstance.getEventos();
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado ninguna invitacion navideña");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getEventosByAsistirOrNo")
  @UseGuards(AuthGuard)
  async getEventosByAsistirOrNo(
    @Headers("authorization") authHeader: string,
    @Query() { asistira }: { asistira: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respCalendario =
        await this.calendarioFestivosInstance.getEventosByAsistirOrNo(asistira);
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado nadie que asistira ");
    } catch (error) {
      console.log(error);
    }
  }
}
