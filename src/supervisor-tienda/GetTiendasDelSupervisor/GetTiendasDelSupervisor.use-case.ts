import { Injectable } from "@nestjs/common";
import { IGetTiendasDelSupervisor } from "./IGetTiendasDelSupervisor.use-case";
import { Tienda } from "../../tiendas/tiendas.class";
import { Tienda as TTienda } from "@prisma/client";
import { ISubordinadoRepository } from "../../subordinado/repository/ISubordinado.repository";
import { RoleService } from "../../role/role.service";

@Injectable()
export class GetTiendasDelSupervisor implements IGetTiendasDelSupervisor {
  constructor(
    private readonly subordinoRepository: ISubordinadoRepository,
    private readonly roleService: RoleService,
    private readonly tiendaService: Tienda,
  ) {}

  async execute(idSupervisor: number): Promise<TTienda[]> {
    try {
      if (this.roleService.hasRole(idSupervisor, "Super_Admin"))
        return await this.tiendaService.getTiendas();

      // Obtener listado de trabajadores subordinados suyos.
      const arraySubordinados =
        await this.subordinoRepository.getSubordinados(idSupervisor);

      if (!arraySubordinados || arraySubordinados.length === 0) {
        return [];
      }

      // Crear el array sin repeticiones de las tiendas de sus subordinados.
      const tiendasACargo = arraySubordinados
        .map((subordinado) => subordinado.tienda)
        .filter((tienda) => tienda !== null && tienda !== undefined); // Filtrar tiendas null/undefined

      // Eliminar tiendas repetidas por tiendaACargo.id
      const tiendasUnicas = tiendasACargo.filter(
        (tienda, index, self) =>
          tienda && self.findIndex((t) => t && t.id === tienda.id) === index,
      );

      return tiendasUnicas;
    } catch (error) {
      console.error("Error en GetTiendasDelSupervisor.execute:", error);
      throw error;
    }
  }
}
