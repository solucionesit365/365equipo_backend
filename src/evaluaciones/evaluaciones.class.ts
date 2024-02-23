import { Injectable } from "@nestjs/common";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";
import { evaluacionesInterface, iluoInterface } from "./evaluaciones.interface";

@Injectable()
export class EvaluacionesService {
  constructor(private readonly evaluacionesDB: EvaluacionesDatabase) {}

  async addPlantilla(evaluacion: evaluacionesInterface) {
    const response = await this.evaluacionesDB.addplantilla(evaluacion);

    if (response) {
      return true;
    }
  }

  async getPlantillas(tipo: string) {
    const response = await this.evaluacionesDB.getPlantillas(tipo);

    if (response) {
      return response;
    }
  }
  async getPlantillasAdmin() {
    const response = await this.evaluacionesDB.getPlantillasAdmin();

    if (response) {
      return response;
    }
  }

  async getEvaluacionAdminRespondidas(idSql: number, año: number) {
    const response = await this.evaluacionesDB.getEvaluacionAdminRespondidas(
      idSql,
      año,
    );

    if (response) {
      return response;
    }
  }

  async getEvaluaciones() {
    const response = await this.evaluacionesDB.getEvaluaciones();

    if (response) {
      return response;
    }
  }

  async deletePlantillaAdmin(evaluacion: evaluacionesInterface) {
    return await this.evaluacionesDB.deletePlantillaAdmin(evaluacion);
  }

  async addEvaluacion(evaluacion: evaluacionesInterface) {
    const response = await this.evaluacionesDB.addEvaluacion(evaluacion);

    if (response) {
      return response;
    }
  }

  async getEvaluados(idSql: number, año: number) {
    const response = await this.evaluacionesDB.getEvaluados(idSql, año);

    if (response) {
      return response;
    }
  }

  //add ILUO
  async addILUO(evaluacion: iluoInterface) {
    const response = await this.evaluacionesDB.addILUO(evaluacion);

    if (response) {
      return true;
    }
  }

  async getPlantillasILUO(plantillaAsociada: string) {
    const response = await this.evaluacionesDB.getPlantillasILUO(
      plantillaAsociada,
    );

    if (response) {
      return response;
    }
  }

  async addILUORespuestas(iluo: iluoInterface) {
    const response = await this.evaluacionesDB.addILUORespuestas(iluo);

    if (response) {
      return response;
    }
  }

  async getILUORespuestas(idSql: number, año: number) {
    const response = await this.evaluacionesDB.getILUORespuestas(idSql, año);

    if (response) {
      return response;
    }
  }
}
