/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { ParametrosDatabase } from "./parametros.mongodb";

@Injectable()
export class ParametrosService {
  constructor(private readonly Database: ParametrosDatabase) {}
  async getParametros() {
    return await this.Database.getParametros();
  }
}

