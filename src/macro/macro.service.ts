import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MacroService {
  constructor(private readonly prismaService: PrismaService) {}

  // Coordinadoras reales, porque tiene filtro de t-- y m--
  async corregirCoordinadoras() {
    const coordinadoras = await this.prismaService.trabajador.findMany({
      where: {
        llevaEquipo: true,
        idTienda: { not: null },
        OR: [
          {
            tienda: {
              nombre: {
                contains: "t--",
                mode: "insensitive", // no distingue mayúsculas/minúsculas
              },
            },
          },
          {
            tienda: {
              nombre: {
                contains: "m--",
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });

    const resultados = await Promise.all(
      coordinadoras.map(({ id, idTienda }) =>
        this.prismaService.tienda.update({
          where: { id: idTienda! },
          data: {
            // Conecta la relación 'coordinator' al Trabajador.id
            coordinator: { connect: { id } },
          },
        }),
      ),
    );

    return resultados; // array de tiendas ya actualizadas
  }
}
