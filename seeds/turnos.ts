import { PrismaClient, Prisma } from "@prisma/client";
import { DateTime } from "luxon";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Uso: NODE_ENV=test npx ts-node seeds/turnos.ts <fecha_lunes_dd/MM/yyyy> <idTienda> <idTrabajador>",
    );
    console.error(
      "Ejemplo: NODE_ENV=test npx ts-node seeds/turnos.ts 10/11/2025 1 8793",
    );
    process.exit(1);
  }

  const [fechaLunesStr, idTiendaStr, idTrabajadorStr] = args;

  // Parsear la fecha del lunes
  const fechaLunes = DateTime.fromFormat(fechaLunesStr, "dd/MM/yyyy");
  if (!fechaLunes.isValid) {
    console.error(
      `Fecha inválida: ${fechaLunesStr}. Debe ser formato dd/MM/yyyy`,
    );
    process.exit(1);
  }

  // Verificar que sea lunes
  if (fechaLunes.weekday !== 1) {
    console.error(
      `La fecha ${fechaLunesStr} no es lunes. Por favor, proporciona un lunes.`,
    );
    process.exit(1);
  }

  // Parsear los IDs
  const idTienda = parseInt(idTiendaStr);
  const idTrabajador = parseInt(idTrabajadorStr);

  if (isNaN(idTienda)) {
    console.error(`ID de tienda inválido: ${idTiendaStr}. Debe ser un número.`);
    process.exit(1);
  }

  if (isNaN(idTrabajador)) {
    console.error(
      `ID de trabajador inválido: ${idTrabajadorStr}. Debe ser un número.`,
    );
    process.exit(1);
  }

  console.log(`Iniciando seed de turnos para la semana del ${fechaLunesStr}`);
  console.log(`ID Tienda: ${idTienda}`);
  console.log(`ID Trabajador: ${idTrabajador}`);

  // Conectar a PostgreSQL
  const prisma = new PrismaClient();

  try {
    // Verificar que la tienda existe
    const tienda = await prisma.tienda.findUnique({
      where: {
        id: idTienda,
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    if (!tienda) {
      console.error(`No se encontró ninguna tienda con ID: ${idTienda}`);
      process.exit(1);
    }

    console.log(`Tienda encontrada: ${tienda.nombre} (ID: ${tienda.id})`);

    // Verificar que el trabajador existe
    const trabajador = await prisma.trabajador.findUnique({
      where: {
        id: idTrabajador,
      },
      select: {
        id: true,
        nombreApellidos: true,
      },
    });

    if (!trabajador) {
      console.error(
        `No se encontró ningún trabajador con ID: ${idTrabajador}`,
      );
      process.exit(1);
    }

    console.log(
      `Trabajador encontrado: ${trabajador.nombreApellidos} (ID: ${trabajador.id})`,
    );

    // Generar turnos para la semana (lunes a viernes)
    const turnos: Prisma.TurnoCreateManyInput[] = [];
    const diasSemana = 5; // Lunes a viernes

    for (let dia = 0; dia < diasSemana; dia++) {
      const fecha = fechaLunes.plus({ days: dia });

      // Turno de 09:00 a 18:00
      const inicio = fecha.set({
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const final = fecha.set({
        hour: 18,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      turnos.push({
        inicio: inicio.toJSDate(),
        final: final.toJSDate(),
        tiendaId: idTienda,
        idTrabajador: idTrabajador,
        borrable: true,
        bolsaHorasInicial: 0,
      });
    }

    console.log(
      `Insertando ${turnos.length} turnos (${diasSemana} días, 1 turno por día)...`,
    );

    // Insertar turnos en PostgreSQL
    const result = await prisma.turno.createMany({
      data: turnos,
    });

    console.log(`✅ Se insertaron ${result.count} turnos correctamente`);

    // Mostrar resumen de los turnos creados
    console.log("\nResumen de turnos creados:");
    turnos.forEach((turno, index) => {
      const inicioDateTime = DateTime.fromJSDate(turno.inicio as Date);
      const finalDateTime = DateTime.fromJSDate(turno.final as Date);
      const diaSemana = inicioDateTime.setLocale("es").toFormat("cccc");
      console.log(
        `  ${index + 1}. ${diaSemana} ${inicioDateTime.toFormat("dd/MM/yyyy")} - ${inicioDateTime.toFormat("HH:mm")} a ${finalDateTime.toFormat("HH:mm")}`,
      );
    });

    // Cerrar conexión
    await prisma.$disconnect();

    console.log("\nProceso completado exitosamente");
  } catch (error) {
    console.error("Error durante el proceso:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
