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

  async getTrabajadores() {
    // Esta función tenía el todos = false)
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        // Filtra para incluir solo trabajadores con al menos un contrato vigente
        contratos: {
          some: {
            fechaBaja: null, // Contrato aún vigente
          },
        },
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

    return trabajadores;
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: idTrabajador,
        tokenQR: tokenQR,
        contratos: {
          some: {
            fechaBaja: null,
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    if (trabajador.tokenQR === tokenQR) {
      return true;
    } else {
      return false;
    }
  }

  async getTrabajadoresByTienda(idTienda: number) {
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        idTienda: idTienda,
        contratos: {
          some: {
            fechaBaja: null,
          },
        },
      },
      include: {
        contratos: {
          where: {
            fechaBaja: null,
          },
          orderBy: {
            fechaAlta: "desc",
          },
          take: 1,
        },
      },
    });

    return trabajadores;
  }
}
