import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { ArchivoDigitalInterface } from "./archivo-digital.interface";
import { ObjectId } from "mongodb";

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

  async getarchivos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection.find({}).toArray();

    return respArchivos;
  }

  //Eliminar
  async deleteArchivo(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");

    const resDelete = await archivosDigitalCollection.deleteOne({
      _id: new ObjectId(_id),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  //Filtros
  async getArchivosByPropietario(propietario: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection
      .find({ propietario })
      .toArray();

    return respArchivos;
  }

  async getArchivosByTipo(tipo: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection
      .find({ tipo })
      .toArray();

    return respArchivos;
  }

  async getArchivosByCreación(creacion: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection
      .find({ creacion })
      .toArray();

    return respArchivos;
  }

  //Ver archivos trabajadores
  async getArchivosByPropietarioAndTipo(propietario: number, tipo: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const archivosDigitalCollection =
      db.collection<ArchivoDigitalInterface>("archivoDigital");
    const respArchivos = await archivosDigitalCollection
      .find({ propietario, tipo })
      .toArray();

    return respArchivos;
  }
}
