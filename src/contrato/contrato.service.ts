import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";

@Injectable()
export class ContratoService {
  constructor(private readonly prisma: PrismaService) {}

  // async getHistoriaContratos(): Promise<
  //   {
  //     horasContrato: number;
  //     dni: string;
  //     inicioContrato: string;
  //     finalContrato: string;
  //     fechaAlta: string;
  //     fechaAntiguedad: string;
  //     fechaBaja: string;
  //   }[]
  // > {
  //   const sql = `
  // SELECT
  //   PorJornada as horasContrato,
  //   Dni as dni,
  //   CONVERT(nvarchar, FechaInicioContrato, 103) as inicioContrato,
  //   CONVERT(nvarchar, FechaFinalContrato, 103) as finalContrato,
  //   CONVERT(nvarchar, FechaAlta, 103) as fechaAlta,
  //   CONVERT(nvarchar, FechaAntiguedad, 103) as fechaAntiguedad,
  //   CONVERT(nvarchar, FechaBaja, 103) as fechaBaja
  // FROM silema_ts.sage.dbo.EmpleadoNomina`;

  //   const resHisContratos = await this.hitMssqlService.recHit(sql);

  //   // if (resHisContratos.recordset.length > 0) return resHisContratos.recordset;
  //   return [];
  // }

  // async copiarHistoriaContratosHitSoluciones() {
  //   const arrayContratos = await this.getHistoriaContratos();

  //   if (arrayContratos.length === 0)
  //     throw Error("No hay contratos para traspasar");

  //   await this.prisma.contrato.deleteMany({});

  //   await this.prisma.contrato.createMany({
  //     data: arrayContratos.map((row) => {
  //       return {
  //         idTrabajador:
  //         horasContrato: row.horasContrato,
  //         dni: row.dni,
  //         inicioContrato: convertToDate(row.inicioContrato),
  //         finalContrato: convertToDate(row.finalContrato),
  //         fechaAlta: convertToDate(row.fechaAlta),
  //         fechaAntiguedad: convertToDate(row.fechaAntiguedad),
  //         fechaBaja: convertToDate(row.fechaBaja),
  //       };
  //     }),
  //   });

  //   return true;
  // }

  async getHistoricoContratos(dni: string) {
    const resContratos = await this.prisma.contrato2.findMany({
      where: {
        Trabajador: {
          dni: dni,
        },
      },
    });

    if (resContratos.length === 0) return null;

    return resContratos;
  }

  async descargarHistoriaContratos() {
    return 1;
    // return await this.copiarHistoriaContratosHitSoluciones();
  }

  async getHorasContratoById(idSql: number, fecha: DateTime) {
    return await this.getHorasContrato(idSql, fecha);
  }

  async getHorasContratoByIdNew(idSql: number, fecha: DateTime) {
    return await this.getHorasContrato(idSql, fecha);
  }

  // Recuerda: la zona horario es clave (en el servidor y el motor de MySQL).
  async getHorasContrato(idSql: number, conFecha: DateTime) {
    const fecha = conFecha.endOf("day");

    const response = await this.prisma.contrato2.findFirst({
      where: {
        Trabajador: {
          id: idSql,
        },
        fechaAlta: {
          lte: fecha.toJSDate(),
        },
        OR: [
          { fechaBaja: null },
          {
            fechaBaja: {
              gte: fecha.toJSDate(),
            },
          },
        ],
      },
    });

    if (response) return (Number(response.horasContrato) * 40) / 100;

    return null;
  }

  async getHorasContratoNew(idSql: number, conFecha: DateTime) {
    await this.getHorasContrato(idSql, conFecha);
  }

  async getContratoByDni(dni: string) {
    try {
      const resContrato = await this.prisma.contrato2.findMany({
        where: {
          Trabajador: {
            dni: dni,
          },
        },
      });

      if (resContrato.length === 0) return null;

      return resContrato;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener el contrato por DNI",
      );
    }
  }
}
