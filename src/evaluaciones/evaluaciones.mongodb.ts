import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { evaluacionesInterface, iluoInterface } from "./evaluaciones.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class EvaluacionesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async addplantilla(plantilla: evaluacionesInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");

    const resInsert = await evaluacionesCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva plantilla");
  }
  async getPlantillas(tipo: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");
    const response = await evaluacionesCollect.find({ tipo }).toArray();

    return response;
  }

  async getPlantillasAdmin() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");
    const response = await evaluacionesCollect.find({}).toArray();

    return response;
  }

  async getEvaluacionAdminRespondidas(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect = db.collection<evaluacionesInterface>(
      "evaluacionesRespuestas",
    );
    const query = {
      "encuestado.idSql": idSql,
      "encuestado.año": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  async getEvaluaciones() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect = db.collection<evaluacionesInterface>(
      "evaluacionesRespuestas",
    );
    const response = await evaluacionesCollect.find().toArray();

    return response;
  }

  async deletePlantillaAdmin(evaluacion: evaluacionesInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");
    const respEvaluacion = await evaluacionesCollect.deleteOne({
      _id: new ObjectId(evaluacion._id),
    });

    return respEvaluacion.acknowledged && respEvaluacion.deletedCount > 0;
  }

  async addEvaluacion(evaluacion: evaluacionesInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect = db.collection<evaluacionesInterface>(
      "evaluacionesRespuestas",
    );

    const response = await evaluacionesCollect.insertOne(evaluacion);

    return response;
  }

  async getEvaluados(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect = db.collection<evaluacionesInterface>(
      "evaluacionesRespuestas",
    );

    const query = {
      "encuestado.idSql": idSql,
      "encuestado.año": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  //add ILUO
  async addILUO(plantilla: iluoInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const iluoCollect = db.collection<iluoInterface>("iluo");

    const resInsert = await iluoCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el nuevo ILUO");
  }

  // get ILUO
  async getPlantillasILUO(plantillaAsociada: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const iluoCollect = db.collection<iluoInterface>("iluo");
    const response = await iluoCollect.find({ plantillaAsociada }).toArray();

    return response;
  }

  //add respuestas iluo
  async addILUORespuestas(iluo: iluoInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const iluoCollect = db.collection<iluoInterface>("iluoRespuestas");

    const response = await iluoCollect.insertOne(iluo);

    return response;
  }

  //getILUO respuestas
  async getILUORespuestas(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect = db.collection<iluoInterface>("iluoRespuestas");

    const query = {
      "encuestado.idSql": idSql,
      "encuestado.año": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }
}
