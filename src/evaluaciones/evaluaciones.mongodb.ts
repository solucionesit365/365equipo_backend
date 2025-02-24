import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import {
  CreateEvaluacionesInterfaceDto,
  CrearIluoInterfaceDto,
  MostrarEvaluacionDto,
  MostrarIluoInterfaceDto,
} from "./evaluaciones.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class EvaluacionesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async addplantilla(plantilla: CreateEvaluacionesInterfaceDto) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect =
      db.collection<CreateEvaluacionesInterfaceDto>("evaluaciones");

    const resInsert = await evaluacionesCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva plantilla");
  }
  async getPlantillas(tipo: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect =
      db.collection<MostrarEvaluacionDto>("evaluaciones");
    const response = await evaluacionesCollect.find({ tipo }).toArray();

    return response;
  }

  async getPlantillasAdmin() {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect =
      db.collection<MostrarEvaluacionDto>("evaluaciones");
    const response = await evaluacionesCollect.find({}).toArray();

    return response;
  }

  async getEvaluacionAdminRespondidas(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<MostrarEvaluacionDto>(
      "evaluacionesRespuestas",
    );
    const query = {
      "encuestado.idSql": idSql,
      "encuestado.year": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  async getEvaluaciones() {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<MostrarEvaluacionDto>(
      "evaluacionesRespuestas",
    );
    const response = await evaluacionesCollect.find().toArray();

    return response;
  }

  async getEvaluacionById(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const auditoriasCollection =
      db.collection<MostrarEvaluacionDto>("evaluaciones");
    const respAuditorias = await auditoriasCollection
      .find({ _id: new ObjectId(_id) })
      .toArray();
    return respAuditorias;
  }

  async deletePlantillaAdmin(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect =
      db.collection<MostrarEvaluacionDto>("evaluaciones");
    const respEvaluacion = await evaluacionesCollect.deleteOne({
      _id: new ObjectId(_id),
    });

    return respEvaluacion.acknowledged && respEvaluacion.deletedCount > 0;
  }

  async addEvaluacion(evaluacion: CreateEvaluacionesInterfaceDto) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<CreateEvaluacionesInterfaceDto>(
      "evaluacionesRespuestas",
    );

    const response = await evaluacionesCollect.insertOne(evaluacion);

    return response;
  }

  async getEvaluados(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<MostrarEvaluacionDto>(
      "evaluacionesRespuestas",
    );

    const query = {
      "encuestado.idSql": idSql,
      "encuestado.year": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  async getEvaluadosAdminTiendas(tienda: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<MostrarEvaluacionDto>(
      "evaluacionesRespuestas",
    );

    const query = {
      "encuestado.tienda": tienda,
      "encuestado.year": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  //add ILUO
  async addILUO(plantilla: CrearIluoInterfaceDto) {
    const db = (await this.mongoDbService.getConexion()).db();
    const iluoCollect = db.collection<CrearIluoInterfaceDto>("iluo");

    const resInsert = await iluoCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el nuevo ILUO");
  }

  // get ILUO
  async getPlantillasILUO(plantillaAsociada: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const iluoCollect = db.collection<MostrarIluoInterfaceDto>("iluo");
    const response = await iluoCollect.find({ plantillaAsociada }).toArray();

    return response;
  }

  //add respuestas iluo
  async addILUORespuestas(iluo: CrearIluoInterfaceDto) {
    const db = (await this.mongoDbService.getConexion()).db();
    const iluoCollect = db.collection<CrearIluoInterfaceDto>("iluoRespuestas");

    const response = await iluoCollect.insertOne(iluo);

    return response;
  }

  //getILUO respuestas
  async getILUORespuestas(idSql: number, año: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect =
      db.collection<MostrarIluoInterfaceDto>("iluoRespuestas");

    const query = {
      "encuestado.idSql": idSql,
      "encuestado.year": año,
    };

    const response = await evaluacionesCollect.find(query).toArray();

    return response;
  }

  async updateFirmaEvaluado(_id: string, firmaEvaluado: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const evaluacionesCollect = db.collection<MostrarEvaluacionDto>(
      "evaluacionesRespuestas",
    );
    const resUpdate = await evaluacionesCollect.updateOne(
      {
        _id: new ObjectId(_id),
      },
      {
        $set: {
          firmaEvaluado: firmaEvaluado,
        },
      },
    );

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido actualizar la firma del evaluado");
  }
}
