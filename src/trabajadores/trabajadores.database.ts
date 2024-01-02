import { Injectable } from "@nestjs/common";
import { recHit } from "../bbdd/mssql";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TrabajadorDatabaseService {
  constructor(private prisma: PrismaService) {}

  async getTrabajadorByAppId(uid: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp: uid,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
      },
    });

    return trabajador;
  }

  async getTrabajadorBySqlId(id: number) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: id,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
      },
    });

    return trabajador;
  }

  async getTrabajadorByDni(dni: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        dni: dni,
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null, // Para contratos aún vigentes
          },
          orderBy: {
            fechaAlta: "desc", // Ordena por la fecha más reciente
          },
          take: 1, // Toma solo el contrato más reciente
        },
      },
    });

    return trabajador;
  }

  async getSubordinadosConTienda(idAppResponsable: string) {
    const responsable = await this.getTrabajadorByAppId(idAppResponsable);

    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: responsable.id,
        idTienda: {
          not: null,
        },
      },
      include: {
        tienda: {
          select: { nombre: true },
        },
        responsable: {
          select: { idApp: true },
        },
      },
    });

    return subordinados;
  }
}
