import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { AnunciosService } from "./anuncios.class";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";

@Controller("anuncios")
export class AnunciosController {
  constructor(
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
    private readonly anunciosInstance: AnunciosService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAnuncios(@User() user: UserRecord) {
    try {
      const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
        user.uid,
      );

      // Si el usuario no tiene tienda, o lleva equipo sin tener tienda
      if (
        !usuarioCompleto.idTienda ||
        (usuarioCompleto.llevaEquipo && !usuarioCompleto.idTienda)
      ) {
        return {
          ok: true,
          data: await this.anunciosInstance.getAnuncios(),
        };
      }

      // Si el usuario tiene tienda
      return {
        ok: true,
        data: await this.anunciosInstance.getAnuncios(usuarioCompleto.idTienda),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("addAnuncio")
  async addAnuncio(@Body() anuncio: AnuncioDto) {
    try {
      if (await this.anunciosInstance.addAnuncio(anuncio)) {
        const arrayTrabajador = await this.trabajadores.getTrabajadores();
        const trabajadorConIdApp = arrayTrabajador.some(
          (trabajador) => trabajador.idApp != null,
        );
        if (trabajadorConIdApp) {
          //Notificacion Anuncio
          this.notificaciones.sendNotificationToTopic(
            "NUEVO ANUNCIO",
            "Disponible",
            "notificaciones_generales",
            "/anuncios",
          );
        }

        return {
          ok: true,
        };
      }

      throw Error("No se ha podido insertar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAnuncio")
  async updateAnuncio(@Body() anuncioModificado: UpdateAnuncioDto) {
    try {
      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.
      if (await this.anunciosInstance.updateAnuncio(anuncioModificado))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteAnuncio")
  async deleteAnuncio(@Body() { _id }: { _id: string }) {
    try {
      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.
      if (await this.anunciosInstance.deleteAnuncio(_id))
        return {
          ok: true,
        };
      throw Error("No se ha podido borrar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
