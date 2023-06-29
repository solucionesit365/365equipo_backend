import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";
import { AnunciosService } from "./anuncios.mongodb";
import { Injectable } from "@nestjs/common";
import * as moment from "moment";

@Injectable()
export class AnunciosClass {
  constructor(private readonly anunciosService: AnunciosService) { }

  async getAnuncios(idTienda?: number) {
    const arrayAnuncios = await this.anunciosService.getAnuncios(idTienda);

    if (arrayAnuncios.length > 0) return arrayAnuncios;
    return null;
  }

  async addAnuncio(anuncio: AnuncioDto) {
    if (typeof anuncio.caducidad === "string" && anuncio.caducidad != "")
      anuncio.caducidad = moment(anuncio.caducidad, "DD/MM/YYYY").toDate();
    return await this.anunciosService.addAnuncio(anuncio);
  }

  async updateAnuncio(anuncio: UpdateAnuncioDto) {
    if (typeof anuncio.caducidad === "string" && anuncio.caducidad != "")
      anuncio.caducidad = moment(anuncio.caducidad, "DD/MM/YYYY").toDate();
    return await this.anunciosService.updateAnuncio(anuncio);
  }

  async deleteAnuncio(_id: string) {
    return await this.anunciosService.deleteAnuncio(_id);
  }

  // async guardarOfertaAnuncio(ofertas: OfertasAnuncios) {
  //   return await this.anunciosService.guardarOfertaAnuncio(ofertas);
  // }
}
