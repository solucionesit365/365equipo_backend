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

  async getarchivos() {
    return await this.scharchivoDigital.getarchivos();
  }

  //Eliminar
  async deleteArchivo(_id: string) {
    return await this.scharchivoDigital.deleteArchivo(_id);
  }

  //Filtros
  async getArchivosByPropietario(propietario: number) {
    return await this.scharchivoDigital.getArchivosByPropietario(propietario);
  }

  async getArchivosByTipo(tipo: string) {
    return await this.scharchivoDigital.getArchivosByTipo(tipo);
  }

  async getArchivosByCreación(creacion: Date) {
    return await this.scharchivoDigital.getArchivosByCreación(creacion);
  }

  async getArchivosByPropietarioAndTipo(propietario: number, tipo: string) {
    return await this.scharchivoDigital.getArchivosByPropietarioAndTipo(
      propietario,
      tipo,
    );
  }
}
