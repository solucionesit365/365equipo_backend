import { Injectable } from "@nestjs/common";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";
import {
  CreateEvaluacionesInterfaceDto,
  CrearIluoInterfaceDto,
  MostrarEvaluacionDto,
  MostrarIluoInterfaceDto,
} from "./evaluaciones.dto";

@Injectable()
export class EvaluacionesService {
  constructor(private readonly evaluacionesDB: EvaluacionesDatabase) {}

  async addPlantilla(evaluacion: CreateEvaluacionesInterfaceDto) {
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

  async deletePlantillaAdmin(_id: string) {
    return await this.evaluacionesDB.deletePlantillaAdmin(_id);
  }

  async addEvaluacion(evaluacion: CreateEvaluacionesInterfaceDto) {
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

  async getEvaluadosAdminTiendas(tienda: number, año: number) {
    const response = await this.evaluacionesDB.getEvaluadosAdminTiendas(
      tienda,
      año,
    );

    if (response) {
      return response;
    }
  }

  //add ILUO
  async addILUO(evaluacion: CrearIluoInterfaceDto) {
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

  async addILUORespuestas(iluo: CrearIluoInterfaceDto) {
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

  async updateFirmaEvaluado(_id: string, firmaEvaluado: string) {
    const response = await this.evaluacionesDB.updateFirmaEvaluado(
      _id,
      firmaEvaluado,
    );
    if (response) {
      return response;
    }
  }
}
