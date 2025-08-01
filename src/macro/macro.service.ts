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

  // Corregir coordinadoras basándose en trabajadores dependientas
  async corregirCoordinadoras() {
    console.log('🔧 Iniciando corrección de coordinadoras...');
    
    // 1. Buscar todos los trabajadores dependientas (que NO llevan equipo y están en tiendas t-- o m--)
    const dependientas = await this.prismaService.trabajador.findMany({
      where: {
        llevaEquipo: false, // NO llevan equipo (son dependientas)
        idTienda: { not: null },
        tienda: {
          OR: [
            {
              nombre: {
                contains: "t--",
                mode: "insensitive",
              },
            },
            {
              nombre: {
                contains: "m--", 
                mode: "insensitive",
              },
            },
          ],
        },
      },
      include: {
        tienda: true,
      },
    });

    console.log(`📊 Encontradas ${dependientas.length} dependientas en tiendas t-- o m--`);

    if (dependientas.length === 0) {
      console.log('⚠️ No se encontraron dependientas. Finalizando proceso.');
      return [];
    }

    // 2. Agrupar por tienda y buscar las coordinadoras de cada tienda
    const tiendasConDependientas = new Map<number, { idTienda: number; nombreTienda: string }>();
    
    dependientas.forEach(dependienta => {
      if (dependienta.idTienda && dependienta.tienda) {
        tiendasConDependientas.set(dependienta.idTienda, {
          idTienda: dependienta.idTienda,
          nombreTienda: dependienta.tienda.nombre,
        });
      }
    });

    console.log(`🏪 Tiendas identificadas: ${tiendasConDependientas.size}`);

    // 3. Para cada tienda, buscar la coordinadora (trabajador que SÍ lleva equipo en esa tienda)
    const coordinadorasArray: { idCoordinadora: number; idTienda: number }[] = [];
    
    for (const { idTienda, nombreTienda } of tiendasConDependientas.values()) {
      const coordinadora = await this.prismaService.trabajador.findFirst({
        where: {
          idTienda: idTienda,
          llevaEquipo: true, // SÍ lleva equipo (es coordinadora)
        },
      });

      if (coordinadora) {
        coordinadorasArray.push({
          idCoordinadora: coordinadora.id,
          idTienda: idTienda,
        });
        console.log(`👩‍💼 Coordinadora encontrada: ${coordinadora.nombreApellidos} para tienda ${nombreTienda} (ID: ${idTienda})`);
      } else {
        console.log(`⚠️ No se encontró coordinadora para tienda ${nombreTienda} (ID: ${idTienda})`);
      }
    }

    console.log(`🎯 Total coordinadoras a actualizar: ${coordinadorasArray.length}`);

    // 4. Actualizar el campo coordinadoraDeLaTienda para cada coordinadora
    const resultados = await Promise.all(
      coordinadorasArray.map(async ({ idCoordinadora, idTienda }) => {
        try {
          // Actualizar el trabajador para asignar coordinadoraDeLaTienda
          const trabajadorActualizado = await this.prismaService.trabajador.update({
            where: { id: idCoordinadora },
            data: {
              coordinadoraDeLaTienda: { connect: { id: idTienda } },
            },
            include: {
              coordinadoraDeLaTienda: true,
            },
          });

          console.log(`✅ Actualizada coordinadora ${trabajadorActualizado.nombreApellidos} para tienda ID: ${idTienda}`);
          return trabajadorActualizado;
        } catch (error) {
          console.error(`❌ Error actualizando coordinadora ID: ${idCoordinadora} para tienda ID: ${idTienda}`, error);
          return null;
        }
      })
    );

    const exitosos = resultados.filter(Boolean);
    const fallidos = resultados.length - exitosos.length;

    console.log(`🎉 Proceso completado:`);
    console.log(`   ✅ Coordinadoras actualizadas exitosamente: ${exitosos.length}`);
    console.log(`   ❌ Fallos: ${fallidos}`);

    return {
      totalProcesadas: coordinadorasArray.length,
      exitosas: exitosos.length,
      fallidas: fallidos,
      coordinadoras: exitosos,
    };
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
