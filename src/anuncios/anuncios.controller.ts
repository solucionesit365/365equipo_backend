import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { AnunciosService } from "./anuncios.class";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";

@Controller("anuncios")
export class AnunciosController {
  constructor(
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
    private readonly anunciosInstance: AnunciosService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAnuncios(@User() user: DecodedIdToken) {
    try {
      const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
        user.uid,
      );

      if (usuarioCompleto.llevaEquipo && !usuarioCompleto.idTienda) {
        return {
          ok: true,
          data: await this.anunciosInstance.getAnuncios(),
        };
      } else if (usuarioCompleto.idTienda) {
        return {
          ok: true,
          data: await this.anunciosInstance.getAnuncios(
            usuarioCompleto.idTienda,
          ),
        };
      } else
        return {
          ok: true,
          data: [],
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
      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.

      //Notificacion Anuncio
      if (await this.anunciosInstance.addAnuncio(anuncio)) {
        const arrayTrabajador = await this.trabajadores.getTrabajadores();
        arrayTrabajador.forEach((trabajador) => {
          if (trabajador.idApp != null) {
            this.notificaciones.newInAppNotification({
              uid: trabajador.idApp,
              titulo: "Nuevo anuncio",
              mensaje: "Tienes un nuevo anuncio ves al tablón de anuncios",
              leido: false,
              creador: "SISTEMA",
              url: "/anuncios",
            });
          }
        });

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
