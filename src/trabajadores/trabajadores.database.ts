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

  async getSubordinadosConTienda(idAppResponsable: string) {
    // Encuentra el id del responsable usando idApp
    const responsable = await this.prisma.trabajador.findUnique({
      where: {
        idApp: idAppResponsable,
      },
      select: {
        id: true,
      },
    });

    if (!responsable) return [];

    // Obtén los trabajadores subordinados
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: responsable.id,
        idTienda: {
          not: null,
        },
      },
      include: {
        tienda: true,
        responsable: {
          select: {
            idApp: true,
          },
        },
      },
    });

    // Calcula llevaEquipo para cada trabajador
    const trabajadoresConLlevaEquipo = await Promise.all(
      trabajadores.map(async (trabajador) => {
        const conteo = await this.prisma.trabajador.count({
          where: {
            idResponsable: trabajador.id,
          },
        });

        return {
          ...trabajador,
          llevaEquipo: conteo > 0,
          nombreTienda: trabajador.tienda?.nombre,
          validador: trabajador.responsable?.idApp,
        };
      }),
    );

    return trabajadoresConLlevaEquipo;
  }

  async esCoordinadora(uid: string) {
    // Ahora no tiene en cuenta el campo "llevaEquipo"

    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp: uid,
      },
      // Incluye información relacionada
      include: {
        responsable: {
          select: {
            id: true,
          },
        },
        subordinados: {
          select: {
            id: true,
          },
        },
      },
    });

    // Verifica si el trabajador existe y si tiene subordinados
    if (
      trabajador &&
      trabajador.subordinados &&
      trabajador.subordinados.length > 0
    ) {
      return true;
    }
    return false;
  }
  async esCoordinadoraPorId(id: number) {
    // Ahora no tiene en cuenta el campo "llevaEquipo"

    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        id: id,
      },
      // Incluye información relacionada
      include: {
        responsable: {
          select: {
            id: true,
          },
        },
        subordinados: {
          select: {
            id: true,
          },
        },
      },
    });

    // Verifica si el trabajador existe y si tiene subordinados
    if (
      trabajador &&
      trabajador.subordinados &&
      trabajador.subordinados.length > 0
    ) {
      return true;
    }
    return false;
  }

  async getSubordinados(idApp: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: {
        idApp: idApp,
      },
      select: {
        id: true,
      },
    });

    if (!trabajador) return [];

    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: trabajador.id,
      },
    });

    return subordinados;
  }

  async getSubordinadosById(id: number) {
    const subordinados = await this.prisma.trabajador.findMany({
      where: {
        idResponsable: id,
      },
    });

    return subordinados;
  }
}
