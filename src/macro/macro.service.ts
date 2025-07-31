import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MongoService } from "../mongo/mongo.service";
import { ObjectId } from "mongodb";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

interface ITurnosMongoResuelto {
  _id: string;
  idTrabajador: number;
  idTienda: 85;
  inicio: string; // ISODate
  final: string; // ISODate
  nombre: string;
  totalHoras: number;
  enviado: boolean;
  horasContrato: number;
  bolsaHorasInicial: number;
  borrable: boolean;
}

interface ITurnosMongoBBDD {
  _id: ObjectId;
  idTrabajador: number;
  idTienda: 85;
  inicio: Date; // ISODate
  final: Date; // ISODate
  nombre: string;
  totalHoras: number;
  enviado: boolean;
  horasContrato: number;
  bolsaHorasInicial: number;
  borrable: boolean;
}

@Injectable()
export class MacroService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mongoService: MongoService,
  ) {}

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

  async migrarTurnos() {
    // Traer los turnos de Mongo OK
    // Mapear los turnos y convertirlos al formato de Prisma
    // Insertar los turnos en Prisma

    const db = (await this.mongoService.getConexion()).db();
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);

    // Filtrar también donde ausencia es null o undefined
    const filtro = {
      inicio: { $gt: unMesAtras },
      $or: [{ ausencia: null }, { ausencia: { $exists: false } }],
    };

    const turnos = await db
      .collection<ITurnosMongoBBDD>("cuadrantes2")
      .find(filtro)
      .toArray();

    // Obtener IDs de trabajadores existentes en Prisma
    const trabajadoresExistentes = await this.prismaService.trabajador.findMany(
      {
        select: { id: true },
      },
    );
    const idsExistentes = new Set(trabajadoresExistentes.map((t) => t.id));

    const turnosPrisma: Prisma.TurnoCreateManyInput[] = turnos
      .filter((turnoMongo) => idsExistentes.has(turnoMongo.idTrabajador))
      .map(function (turnoMongo) {
        return {
          inicio: DateTime.fromJSDate(turnoMongo.inicio).toJSDate(),
          final: DateTime.fromJSDate(turnoMongo.final).toJSDate(),
          tiendaId: turnoMongo.idTienda,
          idTrabajador: turnoMongo.idTrabajador,
          bolsaHorasInicial: turnoMongo.bolsaHorasInicial,
          borrable: turnoMongo.borrable,
        };
      });

    if (turnosPrisma.length > 0) {
      await this.prismaService.turno.createMany({
        data: turnosPrisma,
      });
    }
  }
}
