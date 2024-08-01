import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TipoAusencia } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class AusenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async nuevaAusencia(
    idTrabajador: number,
    tipo: TipoAusencia,
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
    fechaRevision: DateTime,
    comentario: string,
    completa: boolean,
    horas: number,
  ) {
    const ausencia = await this.prisma.ausencia.create({
      data: {
        trabajador: {
          connect: {
            id: idTrabajador,
          },
        },
        tipo,
        tienda: {
          connect: {
            id: idTienda,
          },
        },
        inicio: fechaInicio.toJSDate(),
        final: fechaFinal.toJSDate(),
        fechaRevision: fechaRevision.toJSDate(),
        comentario: comentario !== "" ? comentario : null,
        completa,
      },
    });

    if (ausencia) {
      await this.checkColisionConPlanes();
    }
  }
}
