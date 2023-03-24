import { AnuncioDto } from "./anuncios.dto";
import * as schAnuncios from "./anuncios.mongodb";

class AnunciosClass {
  async getAnuncios(arrayTiendas: number[]) {
    const arrayAnuncios = await schAnuncios.getAnuncios(arrayTiendas);

    if (arrayAnuncios.length > 0) return arrayAnuncios;
    return null;
  }

  async addAnuncio(anuncio: AnuncioDto) {
    return await schAnuncios.addAnuncio(anuncio);
  }
}

export const anunciosInstance = new AnunciosClass();
