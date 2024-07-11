import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRecord } from "firebase-admin/auth";
import { Prisma, Trabajador } from "@prisma/client";
import { DateTime } from "luxon";
import { Descanso } from "./par-fichaje.dto";

@Injectable()
export class ParFichajeService {
  constructor(private readonly prisma: PrismaService) {}

  private async getParById(user: Trabajador, id: string) {
    const parFichaje = await this.prisma.paresFichaje.findUnique({
      where: {
        id,
      },
    });

    if (parFichaje.trabajadorId !== user.id)
      throw new InternalServerErrorException("No tienes permisos");

    return parFichaje;
  }

  public async getUltimoPar(user: Trabajador) {
    return await this.prisma.paresFichaje.findFirst({
      where: {
        trabajador: {
          id: user.id,
        },
        NOT: {
          estado: "LIBRE",
        },
      },
      orderBy: {
        entrada: "desc",
      },
      include: {
        descansos: true,
      },
    });
  }

  public async entrada(user: Trabajador, latitud?: number, longitud?: number) {
    await this.prisma.paresFichaje.create({
      data: {
        trabajador: {
          connect: {
            id: user.id,
          },
        },
        latitud,
        longitud,
        entrada: DateTime.now().toJSDate(),
        estado: "TRABAJANDO",
      },
    });
  }

  public async salida(user: Trabajador, idPar: string) {
    const parFichaje = await this.getParById(user, idPar);

    if (parFichaje.salida)
      throw new InternalServerErrorException("Ya has fichado la salida");

    await this.prisma.paresFichaje.update({
      where: {
        id: parFichaje.id,
      },
      data: {
        salida: DateTime.now().toJSDate(),
        estado: "LIBRE",
      },
    });
  }

  public async inicioComida(user: Trabajador, idPar: string) {
    const parFichaje = await this.getParById(user, idPar);

    await this.prisma.descanso.create({
      data: {
        parFichaje: {
          connect: {
            id: parFichaje.id,
          },
        },
        trabajador: {
          connect: {
            id: user.id,
          },
        },
        inicio: DateTime.now().toJSDate(),
        tipo: "COMIDA",
      },
    });

    await this.prisma.paresFichaje.update({
      where: {
        id: parFichaje.id,
      },
      data: {
        estado: "COMIENDO",
      },
    });
  }

  public async finalComida(user: Trabajador, idDescanso: string) {
    const descanso = await this.prisma.descanso.update({
      data: {
        final: DateTime.now().toJSDate(),
      },
      where: {
        id: idDescanso,
        trabajadorId: user.id,
      },
    });

    if (!descanso) throw new InternalServerErrorException("No tienes permisos");

    await this.prisma.paresFichaje.update({
      where: {
        id: descanso.idPar,
      },
      data: {
        estado: "TRABAJANDO",
      },
    });
  }

  public async inicioDescanso(user: Trabajador, idPar: string) {
    const parFichaje = await this.getParById(user, idPar);

    await this.prisma.descanso.create({
      data: {
        parFichaje: {
          connect: {
            id: parFichaje.id,
          },
        },
        trabajador: {
          connect: {
            id: user.id,
          },
        },
        inicio: DateTime.now().toJSDate(),
        tipo: "DESCANSO",
      },
    });

    await this.prisma.paresFichaje.update({
      where: {
        id: parFichaje.id,
      },
      data: {
        estado: "DESCANSANDO",
      },
    });
  }

  public async finalDescanso(user: Trabajador, idDescanso: string) {
    const descanso = await this.prisma.descanso.update({
      data: {
        final: DateTime.now().toJSDate(),
      },
      where: {
        id: idDescanso,
        trabajadorId: user.id,
      },
    });

    if (!descanso) throw new InternalServerErrorException("No tienes permisos");

    await this.prisma.paresFichaje.update({
      where: {
        id: descanso.idPar,
      },
      data: {
        estado: "TRABAJANDO",
      },
    });
  }

  public async getSinValidarTienda(
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    const paresTiendaSemana = await this.prisma.paresFichaje.findMany({
      where: {
        lugar: {
          id: idTienda,
        },
        entrada: {
          gte: fechaInicio.toJSDate(),
          lte: fechaFinal.toJSDate(),
        },
        estado: "LIBRE",
      },
    });

    return paresTiendaSemana;
  }
}
