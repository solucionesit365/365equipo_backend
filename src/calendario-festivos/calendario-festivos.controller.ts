import { Body, Controller, Post, UseGuards, Get, Query } from "@nestjs/common";
import { CalendarioFestivoService } from "./calendario-festivos.class";
import {
  CalendarioFestivosInterface,
  eventoNavideño,
} from "./calendario-festivos.interface";
import { AuthGuard } from "../guards/auth.guard";
import { FirebaseService } from "../firebase/firebase.service";

@Controller("calendario-festivos")
export class CalendarioFestivosController {
  constructor(
    private readonly calendarioFestivosInstance: CalendarioFestivoService,
    private readonly authInstance: FirebaseService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevoFestivo")
  async nuevoFestivo(@Body() festivo: CalendarioFestivosInterface) {
    try {
      return {
        ok: true,
        data: await this.calendarioFestivosInstance.nuevoFestivo(festivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getFestivos")
  async getFestivos() {
    try {
      const respCalendario =
        await this.calendarioFestivosInstance.getfestivos();
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado ningun festivo");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getFestivosByTienda")
  async getFestivosByTienda(@Query() { tienda }: { tienda: number }) {
    try {
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

  @UseGuards(AuthGuard)
  @Post("updateFestivo")
  async updateFestivo(@Body() festivo: CalendarioFestivosInterface) {
    try {
      const respCalendario =
        await this.calendarioFestivosInstance.updateFestivo(festivo);

      if (respCalendario)
        return {
          ok: true,
          data: respCalendario,
        };

      throw Error("No se ha podido modificar el evento");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteFestivo")
  async deleteFestivo(@Body() { idFestivo }) {
    try {
      const respCalendario =
        await this.calendarioFestivosInstance.deleteFestivo(idFestivo);
      if (respCalendario)
        return {
          ok: true,
          data: respCalendario,
        };

      throw Error("No se ha podido borrar el festivo");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Notificacion navideña
  @UseGuards(AuthGuard)
  @Post("guardarRespuesta")
  async nuevoEvento(@Body() festivo: eventoNavideño) {
    try {
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

  @UseGuards(AuthGuard)
  @Get("verificarRespuesta")
  async verificacionRespuesta(@Query() { idUsuario }: { idUsuario: number }) {
    try {
      const haRespondido =
        await this.calendarioFestivosInstance.verificacionRespuesta(
          Number(idUsuario),
        );

      return { ok: true, haRespondido: haRespondido }; // Indica si el usuario ha respondido
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getEventos")
  async getEventos() {
    try {
      const respCalendario = await this.calendarioFestivosInstance.getEventos();
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado ninguna invitacion navideña");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getEventosByAsistirOrNo")
  async getEventosByAsistirOrNo(@Query() { asistira }: { asistira: string }) {
    try {
      const respCalendario =
        await this.calendarioFestivosInstance.getEventosByAsistirOrNo(asistira);
      if (respCalendario) return { ok: true, data: respCalendario };
      else throw Error("No se ha encontrado nadie que asistira ");
    } catch (error) {
      console.log(error);
    }
  }
}
