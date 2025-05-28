import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Trabajador, Tienda as TTienda } from "@prisma/client";
import { TrabajadorService } from "../trabajador/trabajador.service";
import { TiendaDatabaseService } from "./tienda.database";

@Injectable()
export class TiendaService {
  constructor(
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly schTiendas: TiendaDatabaseService,
  ) {}

  async getTiendas() {
    return this.ordenarTiendas(await this.schTiendas.getTiendas());
  }

  private ordenarTiendas(tiendas: TTienda[]) {
    return tiendas.sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();

      if (nameA.startsWith("t--") && !nameB.startsWith("t--")) return -1;
      if (!nameA.startsWith("t--") && nameB.startsWith("t--")) return 1;

      if (nameA.startsWith("m--") && !nameB.startsWith("m--")) return -1;
      if (!nameA.startsWith("m--") && nameB.startsWith("m--")) return 1;

      // Si no empiezan con 't--' ni 'm--', se ordenan alfabéticamente
      return nameA.localeCompare(nameB);
    });
  }

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

  // Mongo
  async getTiendas2() {
    return this.ordenarTiendas(await this.schTiendas.geTiendas2());
  }
}
