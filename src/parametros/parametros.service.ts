import { Injectable } from "@nestjs/common";
import { ParametrosDatabase } from "./parametros.mongodb";
import { ParametrosDTO, ParametroDTO2, CorreosFurgosDTO } from "./parametros.dto";

@Injectable()
export class ParametrosService {
  constructor(private readonly parametrosDatabase: ParametrosDatabase) {}

  async getParametros(name: string) {
    return await this.parametrosDatabase.getParametros(name);
  }

  async getParametrosCampaniaMedica() {
    return await this.parametrosDatabase.getParametrosCampaniaMedica();
  }

  async getParametrosCorreosFurgos() {
    return (await this.parametrosDatabase.getParametrosCorreosFurgos());
  }

  async updateParametros(name: string, parametros: Partial<ParametrosDTO>) {
    return await this.parametrosDatabase.updateParametros(name, parametros);
  }

  async updateParametros2(name: string, parametros: Partial<ParametroDTO2>) {
    return await this.parametrosDatabase.updateParametros2(name, parametros);
  }

  async updateCorreosFurgos(name: string, parametros: Partial<CorreosFurgosDTO>) {
    return await this.parametrosDatabase.updateParametrosCorreosFurgos(name, parametros);
  }
}
