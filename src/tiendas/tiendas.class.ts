import {
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from "@nestjs/common";
import { Trabajador, Tienda as TTienda } from "@prisma/client";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { TiendaDatabaseService } from "./tiendas.database";
import { Tiendas2 } from "./tiendas.dto";
import { IGetTiendasAteneaUseCase } from "./GetTiendasAtenea/IGetTiendasAtenea.use-case";

@Injectable()
export class Tienda {
  constructor(
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly schTiendas: TiendaDatabaseService,
    private readonly getTiendasAteneaUseCase: IGetTiendasAteneaUseCase,
  ) {}

  async getTiendas() {
    try {
      return this.ordenarTiendas(await this.schTiendas.getTiendas());
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Error al obtener las tiendas");
    }
  }

  getTiendaByIdExterno(idTienda: number) {
    return this.schTiendas.getTiendaById(idTienda);
  }

  private ordenarTiendas(tiendas: TTienda[]): TTienda[] {
    // console.log(tiendas);
    return tiendas.sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();

      if (nameA.startsWith("t--") && !nameB.startsWith("t--")) return -1;
      if (!nameA.startsWith("t--") && nameB.startsWith("t--")) return 1;

      if (nameA.startsWith("m--") && !nameB.startsWith("m--")) return -1;
      if (!nameA.startsWith("m--") && nameB.startsWith("m--")) return 1;

      return nameA.localeCompare(nameB);
    });
  }

  private ordenarTiendas2(tiendas: Tiendas2[]): Tiendas2[] {
    return tiendas.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA.startsWith("t--") && !nameB.startsWith("t--")) return -1;
      if (!nameA.startsWith("t--") && nameB.startsWith("t--")) return 1;

      if (nameA.startsWith("m--") && !nameB.startsWith("m--")) return -1;
      if (!nameA.startsWith("m--") && nameB.startsWith("m--")) return 1;

      return nameA.localeCompare(nameB);
    });
  }

  // async getTiendasHit() {
  //   return await this.schTiendas.getTiendasHit();
  // }

  // async actualizarTiendas() {
  //   const arrayTiendasApp = await this.getTiendas();
  //   // const arrayTiendasHit = await this.getTiendasHit();

  //   const tiendasExistentesIds = arrayTiendasApp.map(
  //     (tiendaApp) => tiendaApp.idExterno,
  //   );
  //   const tiendasNuevas = arrayTiendasHit.filter(
  //     (tiendaExterno) =>
  //       !tiendasExistentesIds.includes(tiendaExterno.idExterno),
  //   );
  //   return this.schTiendas.addTiendasNuevas(tiendasNuevas);
  // }

  private checkExists(arrayTiendas: any[], buscar: any) {
    for (let i = 0; i < arrayTiendas.length; i += 1) {
      if (arrayTiendas[i].idTienda === buscar.idTienda) return true;
    }
    return false;
  }

  async getTiendasResponsable(trabajador: Trabajador) {
    const arrayTrabajadores =
      await this.trabajadoresInstance.getSubordinadosConTienda(
        trabajador.idApp,
      );
    const arrayTiendas = [];

    for (let i = 0; i < arrayTrabajadores.length; i += 1) {
      if (
        !this.checkExists(arrayTiendas, {
          idTienda: arrayTrabajadores[i].idTienda,
          nombreTienda: arrayTrabajadores[i].nombreTienda,
        })
      ) {
        arrayTiendas.push({
          idTienda: arrayTrabajadores[i].idTienda,
          nombreTienda: arrayTrabajadores[i].nombreTienda,
        });
      }
    }

    return arrayTiendas;
  }

  convertirTiendaToExterno(idInterno: number, tiendas: any[]) {
    for (let i = 0; i < tiendas.length; i += 1) {
      if (tiendas[i].id === idInterno) return tiendas[i].idExterno;
    }
    return null;
  }

  async getTiendas2() {
    try {
      return this.ordenarTiendas2(await this.getTiendasAteneaUseCase.execute());
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Error al obtener las tiendas");
    }
  }

  async addTiendas2(nuevas: Tiendas2) {
    try {
      const result = await this.schTiendas.addTiendas2(nuevas);
      if (!result) return true;
    } catch (err) {
      console.error("Error al agregar tiendas a MongoDB:", err.message);
    }
  }

  async editTienda(tienda: Tiendas2) {
    try {
      const result = await this.schTiendas.editTienda(tienda);
      return result;
    } catch (err) {
      console.error("Error al editar tienda en MongoDB:", err.message);
      return false;
    }
  }

  async deleteTienda(id: number) {
    try {
      const result = await this.schTiendas.deleteTienda(id);
      return result;
    } catch (err) {
      console.error("Error al eliminar tienda en MongoDB:", err.message);
      return false;
    }
  }
}
