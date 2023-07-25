import { Injectable } from "@nestjs/common";
import { ArchivoDigitalInterface } from "./archivo-digital.interface";
import { ArchivoDigitalDatabase } from "./archivo-digital.mongodb";

@Injectable()
export class ArchivoDigital {
  constructor(private readonly scharchivoDigital: ArchivoDigitalDatabase) {}

  async nuevoArchivo(archivo: ArchivoDigitalInterface) {
    const insertArchivo = await this.scharchivoDigital.nuevoArchivo(archivo);
    if (insertArchivo) return true;

    throw Error("No se ha podido subir el archivo");
  }

  async getArchivosByPropietario(propietario: number) {
    return await this.scharchivoDigital.getArchivosByPropietario(propietario);
  }

  // async getarchivos() {
  //     return await this.scharchivoDigital.getarchivos();
  // }
}
