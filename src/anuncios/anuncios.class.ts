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
    if (typeof anuncio.caducidad === "string" && anuncio.caducidad != "")
      anuncio.caducidad = DateTime.fromFormat(
        anuncio.caducidad,
        "dd/MM/yyyy",
      ).toJSDate();
    return await this.schAnuncios.updateAnuncio(anuncio);
  }

  async deleteAnuncio(_id: string) {
    return await this.schAnuncios.deleteAnuncio(_id);
  }

  // async guardarOfertaAnuncio(ofertas: OfertasAnuncios) {
  //   return await this.anunciosService.guardarOfertaAnuncio(ofertas);
  // }
}
