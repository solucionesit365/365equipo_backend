import { Injectable } from "@nestjs/common";
import { NominasDatabase } from "./nominas.database";

@Injectable()
export class Nominas {
  constructor(private readonly schNominas: NominasDatabase) {}

  async getNomina(dni: string, idArchivo: string) {
    return await this.schNominas.getNomina(dni, idArchivo);
  }

  async getListadoNominas(dni: string) {
    return await this.schNominas.getListadoNominas(dni);
  }
}
