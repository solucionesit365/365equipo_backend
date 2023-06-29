import { Controller, Post, Get, Body, Headers } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { AnunciosClass } from "./anuncios.class";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";
import { AuthService } from "../firebase/auth";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";


@Controller("anuncios")
export class AnunciosController {
  constructor(
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: Trabajador,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly anunciosInstance: AnunciosClass,
  ) { }

  @Get()
  async getAnuncios(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const usuario = await this.authInstance.getUserWithToken(token);

      if (usuario.coordinadora && !usuario.idTienda) {
        return {
          ok: true,
          data: await this.anunciosInstance.getAnuncios(),
        };
      } else if (usuario.idTienda) {
        return {
          ok: true,
          data: await this.anunciosInstance.getAnuncios(usuario.idTienda),
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

  @Post("addAnuncio")
  async addAnuncio(
    @Body() anuncio: AnuncioDto,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.

      //Notificacion Anuncio
      if (await this.anunciosInstance.addAnuncio(anuncio)) {
        const arrayTrabajador = await this.trabajadores.getTrabajadores()
        arrayTrabajador.forEach((trabajador) => {
          if (trabajador.idApp != null) {
            this.notificaciones.newInAppNotification({
              uid: trabajador.idApp,
              titulo: "Nuevo anuncio",
              mensaje: "Tienes un nuevo anuncio ves al tablón de anuncios",
              leido: false,
              creador: "SISTEMA",
            })
          }

        })

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

  @Post("updateAnuncio")
  async updateAnuncio(
    @Body() anuncioModificado: UpdateAnuncioDto,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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

  @Post("deleteAnuncio")
  async deleteAnuncio(
    @Body() { _id }: { _id: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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

  // @Post("guardarOfertaAnuncio")
  // async guardarOfertaAnuncio(
  //   @Body() oferta: OfertasAnuncios,
  //   @Headers("authorization") authHeader: string,
  // ) {
  //   try {
  //     const token = this.tokenService.extract(authHeader);
  //     await this.authInstance.verifyToken(token);
  //     if (await this.anunciosInstance.guardarOfertaAnuncio(oferta))
  //       return {
  //         ok: true,
  //       };
  //     throw Error("No se ha podido guardar el anuncio");

  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }

}