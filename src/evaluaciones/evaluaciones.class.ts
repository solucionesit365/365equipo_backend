import { Injectable } from "@nestjs/common";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";
import { evaluacionesInterface } from "./evaluaciones.interface";

@Injectable()
export class EvaluacionesClass {
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

  async getEvalucionAdminRespondidas(idSql: number, año: number) {
    const response = await this.evaluacionesDB.getEvalucionAdminRespondidas(
      idSql,
      año,
    );

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
}
