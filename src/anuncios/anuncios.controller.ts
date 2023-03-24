import { Controller, Post, Body, Headers } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { verifyToken } from "../firebase/auth";
import { anunciosInstance } from "./anuncios.class";
import { AddAnuncioDto } from "./anuncios.dto";

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
  async addAnuncio(
    @Body() addAnuncioDto: AddAnuncioDto,
    @Headers("authorization") authHeader: string,
  ) {
    const { anuncio } = addAnuncioDto;
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.
      if (await anunciosInstance.addAnuncio(anuncio))
        return {
          ok: true,
          data: "Anuncio insertado",
        };
      throw Error("No se ha podido insertar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
