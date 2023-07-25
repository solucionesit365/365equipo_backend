import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { ArchivoDigitalInterface } from "./archivo-digital.interface";

@Injectable()
export class ArchivoDigitalDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async nuevoArchivo(archivo: ArchivoDigitalInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");

    const resInsert = await archivosDigitalCollection.insertOne(archivo);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido subir el archivo");
  }

  async getArchivosByPropietario(propietario: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection
      .find({ propietario })
      .toArray();

    return respArchivos;
  }

  //   async getarchivos() {
  //     const db = (await this.mongoDbService.getConexion()).db("soluciones");
  //     const archivosDigitalCollection = db.collection<ArchivoDigitalInterface>("archivoDigital");
  //     const respArchivos = await archivosDigitalCollection.find({}).toArray();

  //     return respArchivos;
  //   }
}
