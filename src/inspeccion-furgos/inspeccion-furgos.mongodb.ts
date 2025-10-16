import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { ObjectId } from "mongodb";
import { FurgonetaDto, InspeccionFurgos } from "./inspeccion-furgos.dto";

@Injectable()
export class InspeccionFurgosDatabes {
  constructor(private readonly mongoDbService: MongoService) {}

  private async getCollectionInspecciones() {
    const db = (await this.mongoDbService.getConexion()).db();
    return db.collection<InspeccionFurgos>("inspeccionesFurgos");
  }

  private async getCollectionFurgonetas() {
    const db = (await this.mongoDbService.getConexion()).db();
    return db.collection<FurgonetaDto>("furgonetas");
  }

  async nuevaInspeccion(inspeccion: InspeccionFurgos) {
    const collection = await this.getCollectionInspecciones();
    const resInsert = await collection.insertOne(inspeccion);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw new Error("No se ha podido insertar la inspección de furgo");
  }

  async getAllInspecciones() {
    const collection = await this.getCollectionInspecciones();
    return await collection.find({}).sort({ fecha: -1 }).toArray();
  }

  async getInspeccionesByMatricula(matricula: string) {
    const collection = await this.getCollectionInspecciones();
    return await collection.find({ matricula }).toArray();
  }

  // async getTransportistas() {
  //   const collection = await this.getCollection();
  //   const transportistas = await collection
  //     .find({ tienda: "transporte" }, { projection: { nombre: 1, _id: 0 } })
  //     .toArray();

  //   return transportistas.map((t) => t.nombreConductor);
  // }

  async borrarInspeccion(_id: string) {
    const collection = await this.getCollectionInspecciones();
    const resDelete = await collection.deleteOne({ _id: new ObjectId(_id) });
    if (resDelete.deletedCount > 0) return true;
    throw new Error("No se ha podido borrar la inspección de furgo");
  }
  async crearFurgoneta(furgoneta: FurgonetaDto) {
    const collection = await this.getCollectionFurgonetas();

    const existe = await collection.findOne({ matricula: furgoneta.matricula });
    if (existe) {
      throw new Error("Ya existe una furgoneta con esa matrícula");
    }

    const resInsert = await collection.insertOne({
      propietario: furgoneta.propietario?.trim() || "",
      marca: furgoneta.marca?.trim() || "",
      modelo: furgoneta.modelo?.trim() || "",
      matricula: furgoneta.matricula.toUpperCase(),
      fechaMatriculacion: furgoneta.fechaMatriculacion || "",
      conductor: furgoneta.conductor?.trim() || "",
    });

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw new Error("No se ha podido crear la furgoneta");
  }

  async getAllFurgonetas() {
    const collection = await this.getCollectionFurgonetas();
    return await collection.find({}).toArray();
  }

  async actualizarFurgoneta(id: string, furgoneta: FurgonetaDto) {
    const collection = await this.getCollectionFurgonetas();

    const resUpdate = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          propietario: furgoneta.propietario?.trim() || "",
          marca: furgoneta.marca?.trim() || "",
          modelo: furgoneta.modelo?.trim() || "",
          matricula: furgoneta.matricula?.toUpperCase() || "",
          fechaMatriculacion: furgoneta.fechaMatriculacion || "",
          conductor: furgoneta.conductor?.trim() || "",
        },
      },
      { returnDocument: "after" }, // 👈 devuelve el documento actualizado
    );

    if (!resUpdate._id) {
      throw new Error("No se ha podido actualizar la furgoneta o no existe");
    }

    return resUpdate;
  }
}
