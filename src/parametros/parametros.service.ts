import { Injectable } from "@nestjs/common";
import { ParametrosDatabase } from "./parametros.mongodb";
import { ParametrosDTO } from "./parametros.dto";

@Injectable()
export class ParametrosService {
  constructor(private readonly parametrosDatabase: ParametrosDatabase) {}

  async getParametros(name: string) {
    return await this.parametrosDatabase.getParametros(name);
  }

  async updateParametros(name: string, parametros: Partial<ParametrosDTO>) {
    return await this.parametrosDatabase.updateParametros(name, parametros);
  }
}
