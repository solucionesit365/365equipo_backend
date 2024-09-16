import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { EncargosDatabase } from "./encargos.mongodb";
import { EncargosInterface } from "./encargos.interface";

@Injectable()
export class EncargosService {
  constructor(private readonly encargosDB: EncargosDatabase) {}

  async newEncargo(encargo: EncargosInterface) {
    if (typeof encargo.fechaEntrega === "string")
      encargo.fechaEntrega = DateTime.fromFormat(
        encargo.fechaEntrega,
        "dd/MM/yyyy",
      ).toJSDate();
    return await this.encargosDB.newEncargo(encargo);
  }

  async getEncargos(idTienda: number) {
    if (idTienda) {
      return await this.encargosDB.getEncargos(idTienda);
    } else return { ok: false, data: "No hay tienda" };
  }

  async updateEncargo(encargo: EncargosInterface) {
    if (encargo) {
      return await this.encargosDB.updateEncargo(encargo);
    } else return { ok: false, data: "No hay tienda" };
  }

  async getAllEncargos() {
    return await this.encargosDB.getAllEncargos();
  }
}
