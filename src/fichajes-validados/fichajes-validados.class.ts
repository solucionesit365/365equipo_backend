import { Injectable } from "@nestjs/common";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";

@Injectable()
export class FichajesValidados {
  constructor(
    private readonly schFichajesValidados: FichajesValidadosDatabase,
  ) { }

  async addFichajesValidados(fichajeValidado: FichajeValidadoDto) {
    return await this.schFichajesValidados.insertarFichajeValidado(
      fichajeValidado,
    );
  }

  async getFichajesValidados(idTrabajador: number) {
    return await this.schFichajesValidados.getFichajesValidados(idTrabajador);
  };
  async updateFichajesValidados(fichajesValidados: FichajeValidadoDto) {
    return await this.schFichajesValidados.updateFichajesValidados(fichajesValidados);
  }

  async getFichajesPagar(idResponsable: number, aPagar: boolean) {
    return await this.schFichajesValidados.getFichajesPagar(idResponsable, aPagar);
  }

  async getAllFichajesPagar(aPagar: boolean) {
    return await this.schFichajesValidados.getAllFichajesPagar(aPagar);
  }



  async getAllFichajesValidados() {
    return await this.schFichajesValidados.getAllFichajesValidados();
  };

}
