import { Injectable } from "@nestjs/common";
import { CreateTrabajadorRequestDto } from "./trabajador.dto";
import {
  ITrabajadorDatabaseService,
  TIncludeTrabajador,
} from "./trabajador.interface";
import { Prisma } from "@prisma/client";

@Injectable()
export class TrabajadorRepository {
  constructor(private readonly schTrabajadores: ITrabajadorDatabaseService) {}

  crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
    return this.schTrabajadores.crearTrabajador(reqTrabajador);
  }

  async getTrabajadoresModificadosOmne() {
    const trabajadoresRaw = await this.schTrabajadores.getTrabajadoresOmne();
    return this.crearArrayTrabajadores(trabajadoresRaw);
  }

  private crearArrayTrabajadores(trabajadoresRaw: any): any[] {
    return trabajadoresRaw.flatMap((empresa: any) => {
      if (empresa.trabajadores && Array.isArray(empresa.trabajadores)) {
        return empresa.trabajadores.map((trabajador: any) => {
          // Convertir documento a string, pasar a mayúsculas y quitar espacios
          const documentoNormalizado = String(trabajador.documento)
            .toUpperCase()
            .replace(/\s+/g, "");
          return {
            ...trabajador,
            documento: documentoNormalizado,
            empresaID: empresa.empresaID,
          };
        });
      }
      return [];
    });
  }

  getAllTrabajadores(include: TIncludeTrabajador) {
    return this.schTrabajadores.getAllTrabajadores(include);
  }

  // Update Many con diferentes valores a modificar
  updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ) {
    return this.schTrabajadores.actualizarTrabajadoresLote(modificaciones);
  }
}
