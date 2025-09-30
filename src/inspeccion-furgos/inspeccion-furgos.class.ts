import { Injectable } from "@nestjs/common";
import { InspeccionFurgosDatabes } from "./inspeccion-furgos.mongodb";
import { InspeccionFurgos } from "./inspeccion-furgos.dto";

@Injectable()
export class InspeccionFurgosClass {
  constructor(
    private readonly schInspeccionesFurgos: InspeccionFurgosDatabes,
  ) {}

  async nuevaInspeccion(inspeccion: InspeccionFurgos) {
    const insertInspeccion = await this.schInspeccionesFurgos.nuevaInspeccion(
      inspeccion,
    );
    if (insertInspeccion) return true;

    throw new Error("No se ha podido insertar la inspección de furgo");
  }

  async getAllInspecciones() {
    return this.schInspeccionesFurgos.getAllInspecciones();
  }

  async getInspeccionesByMatricula(matricula: string) {
    const inspecciones =
      await this.schInspeccionesFurgos.getInspeccionesByMatricula(matricula);
    if (inspecciones.length > 0) return inspecciones;
    return null;
  }

  async getTransportistas() {
    const transportistas = await this.schInspeccionesFurgos.getTransportistas();
    if (transportistas.length > 0) return transportistas;
    return null;
  }

  async borrarInspeccion(_id: string) {
    return this.schInspeccionesFurgos.borrarInspeccion(_id);
  }
}
