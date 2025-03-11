/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { ParametrosDatabase } from "./parametros.mongodb";

@Injectable()
export class ParametrosService {
  constructor(private readonly Database: ParametrosDatabase) {}
  async getParametros(name: string) {
    return await this.Database.getParametros(name);
  }

  async updateParametros(name, parametros) {
    console.log(parametros);

    return await this.Database.updateParametros(name, parametros);
  }
}
