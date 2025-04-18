import { DateTime } from "luxon";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";
import { AnunciosDatabaseService } from "./anuncios.mongodb";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AnunciosService {
  constructor(private readonly schAnuncios: AnunciosDatabaseService) {}

  async getAnuncios(idTienda?: number) {
    const arrayAnuncios = await this.schAnuncios.getAnuncios(idTienda);

    if (arrayAnuncios.length > 0) return arrayAnuncios;
    return null;
  }

  async addAnuncio(anuncio: AnuncioDto) {
    if (typeof anuncio.caducidad === "string" && anuncio.caducidad != "")
      anuncio.caducidad = DateTime.fromFormat(
        anuncio.caducidad,
        "dd/MM/yyyy",
      ).toJSDate();
    return await this.schAnuncios.addAnuncio(anuncio);
  }

  async updateAnuncio(anuncio: UpdateAnuncioDto) {
    if (
      typeof anuncio.caducidad === "string" &&
      anuncio.caducidad.trim() !== ""
    ) {
      if (!isNaN(Date.parse(anuncio.caducidad))) {
        anuncio.caducidad = new Date(anuncio.caducidad);
      } else {
        const parsedDate = DateTime.fromFormat(anuncio.caducidad, "dd/MM/yyyy");
        if (!parsedDate.isValid) {
          throw new Error("Formato de fecha inválido");
        }
        anuncio.caducidad = parsedDate.toJSDate();
      }
    } else if (!(anuncio.caducidad instanceof Date)) {
      throw new Error("Fecha inválida");
    }

    return await this.schAnuncios.updateAnuncio(anuncio);
  }

  async deleteAnuncio(_id: string) {
    return await this.schAnuncios.deleteAnuncio(_id);
  }

  // async guardarOfertaAnuncio(ofertas: OfertasAnuncios) {
  //   return await this.anunciosService.guardarOfertaAnuncio(ofertas);
  // }

  async getAnuncioById(_id: string) {
    return await this.schAnuncios.getAnuncioById(_id);
  }
}
