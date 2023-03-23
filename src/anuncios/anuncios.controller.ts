import { Controller, Post, Body, Headers, UsePipes } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { verifyToken } from "../firebase/auth";
import { ValidationPipe } from "../validation/validation.pipe";
import { AddAnuncioDto, anunciosInstance } from "./anuncios.class";

@Controller("anuncios")
export class AnunciosController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async getAnuncios(
    @Body() { arrayTiendas },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      if (arrayTiendas && arrayTiendas.length > 0 && token)
        return {
          ok: true,
          data: await anunciosInstance.getAnuncios(arrayTiendas),
        };

      throw Error("Faltan parámetros");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("addAnuncio")
  @UsePipes(ValidationPipe)
  async addAnuncio(
    @Body() addAnuncioDto: AddAnuncioDto,
    @Headers("authorization") authHeader: string,
  ) {
    console.log("estoy entrando aquí");
    const { anuncio } = addAnuncioDto;
    try {
      if (!anuncio) throw Error("Falta, datos");

      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.

      if (anuncio)
        return {
          ok: true,
          data: await anunciosInstance.addAnuncio(anuncio),
        };

      throw Error("Faltan parámetros");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
