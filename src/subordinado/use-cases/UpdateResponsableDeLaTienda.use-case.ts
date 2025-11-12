import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UpdateResponsableDeLaTiendaUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(idTienda: number, idCoordinadora: number) {
    if (!idTienda || !idCoordinadora) {
      throw new Error("ID de tienda y coordinadora son requeridos");
    }

    // Actualizar idResponsable de todos los trabajadores de la tienda
    // excepto la propia coordinadora
    const result = await this.prismaService.trabajador.updateMany({
      where: {
        idTienda: idTienda,
        id: { not: idCoordinadora },
      },
      data: {
        idResponsable: idCoordinadora,
      },
    });

    console.log(
      `✅ Actualizados ${result.count} trabajadores en tienda ${idTienda} con responsable ${idCoordinadora}`,
    );

    return {
      trabajadoresActualizados: result.count,
      idTienda,
      idCoordinadora,
    };
  }

  async addTiendaCoordinadora(tiendaId: number, trabajadorId: number) {
    if (!tiendaId || !trabajadorId) {
      throw new Error("tiendaId y trabajadorId son requeridos");
    }

    // Validaciones de existencia
    const tienda = await this.prismaService.tienda.findUnique({
      where: { id: tiendaId },
    });
    if (!tienda)
      throw new NotFoundException(`Tienda ${tiendaId} no encontrada`);

    const trabajador = await this.prismaService.trabajador.findUnique({
      where: { id: trabajadorId },
    });
    if (!trabajador)
      throw new NotFoundException(`Trabajador ${trabajadorId} no encontrado`);

    // Crear relación (evitar duplicados por unique [tiendaId, trabajadorId])
    try {
      const creado = await this.prismaService.tiendaCoordinadora.create({
        data: {
          tiendaId,
          trabajadorId,
        },
      });

      // Opcional: marcar al trabajador como llevaEquipo = true y asignarle idTienda si procede
      try {
        await this.prismaService.trabajador.update({
          where: { id: trabajadorId },
          data: { llevaEquipo: true, idTienda: tiendaId },
        });
      } catch (err) {
        console.warn(
          "No se pudo actualizar el trabajador tras crear la relación:",
          err,
        );
      }

      return {
        ok: true,
        data: creado,
      };
    } catch (err: any) {
      if (err?.code === "P2002") {
        throw new ConflictException(
          "La relación tienda-coordinadora ya existe",
        );
      }
      throw err;
    }
  }
}
