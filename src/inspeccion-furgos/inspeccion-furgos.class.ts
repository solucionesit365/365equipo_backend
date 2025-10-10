import { Injectable } from "@nestjs/common";
import { InspeccionFurgosDatabes } from "./inspeccion-furgos.mongodb";
import { FurgonetaDto, InspeccionFurgos } from "./inspeccion-furgos.dto";

@Injectable()
export class InspeccionFurgosClass {
  prisma: any;
  furgonetaModel: any;
  constructor(
    private readonly schInspeccionesFurgos: InspeccionFurgosDatabes,
  ) {}

  async nuevaInspeccion(inspeccion: InspeccionFurgos) {
    const insertInspeccion = await this.schInspeccionesFurgos.nuevaInspeccion(
      inspeccion,
    );
    console.log("Insert inspeccion", insertInspeccion);
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

  // async getTransportistas() {
  //   const transportistas = await this.schInspeccionesFurgos.getTransportistas();
  //   if (transportistas.length > 0) return transportistas;
  //   return null;
  // }

  async borrarInspeccion(_id: string) {
    return this.schInspeccionesFurgos.borrarInspeccion(_id);
  }

  async crearFurgoneta(furgoneta: FurgonetaDto) {
    const insertFurgoneta = await this.schInspeccionesFurgos.crearFurgoneta({
      propietario: furgoneta.propietario,
      marca: furgoneta.marca,
      modelo: furgoneta.modelo,
      matricula: furgoneta.matricula,
      fechaMatriculacion: furgoneta.fechaMatriculacion,
      conductor: furgoneta.conductor,
    });

    if (insertFurgoneta) return true;
    throw new Error("No se ha podido crear la furgoneta");
  }

  async getAllFurgonetas() {
    return this.schInspeccionesFurgos.getAllFurgonetas();
  }

  async actualizarFurgoneta(id: string, furgoneta: FurgonetaDto) {
    try {
      const updated = await this.schInspeccionesFurgos.actualizarFurgoneta(
        id,
        furgoneta,
      );

      if (!updated) {
        throw new Error("Furgoneta no encontrada o no actualizada");
      }

      return updated;
    } catch (err) {
      console.error("Error en actualizarFurgoneta:", err);
      throw err;
    }
  }
}
