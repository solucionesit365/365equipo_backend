import { AnuncioDto } from "./anuncios.dto";
import { AnunciosService } from "./anuncios.mongodb";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AnunciosClass {
  constructor(private readonly anunciosService: AnunciosService) {}

  async getAnuncios(arrayTiendas: number[]) {
    const arrayAnuncios = await this.anunciosService.getAnuncios(arrayTiendas);

    if (arrayAnuncios.length > 0) return arrayAnuncios;
    return null;
  }

  async addAnuncio(anuncio: AnuncioDto) {
    return await this.anunciosService.addAnuncio(anuncio);
  }
}
