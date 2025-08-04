import { Injectable } from "@nestjs/common";
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

    console.log(`✅ Actualizados ${result.count} trabajadores en tienda ${idTienda} con responsable ${idCoordinadora}`);

    return {
      trabajadoresActualizados: result.count,
      idTienda,
      idCoordinadora,
    };
  }
}