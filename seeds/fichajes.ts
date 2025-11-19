import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

// Use example: NODE_ENV=test npx ts-node seeds/fichajes.ts 10/11/2025 ofjsdoifjdaifodasadopfsd

interface FichajeDto {
  enviado: boolean;
  hora: Date;
  tipo: "ENTRADA" | "SALIDA";
  uid: string;
  idExterno: number;
  validado: boolean;
  nombre: string;
  dni: string;
  geolocalizacion?: {
    latitud?: number | null;
    longitud?: number | null;
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Uso: NODE_ENV=test npx ts-node seeds/fichajes.ts <fecha_lunes_dd/MM/yyyy> <uid>",
    );
    console.error("Ejemplo: NODE_ENV=test npx ts-node seeds/fichajes.ts 10/11/2025 MxZoHsvMQOMQr4WBS95x5jGcvQ12");
    process.exit(1);
  }

  const [fechaLunesStr, uid] = args;

  // Parsear la fecha del lunes
  const fechaLunes = DateTime.fromFormat(fechaLunesStr, "dd/MM/yyyy");
  if (!fechaLunes.isValid) {
    console.error(`Fecha inválida: ${fechaLunesStr}. Debe ser formato dd/MM/yyyy`);
    process.exit(1);
  }

  // Verificar que sea lunes
  if (fechaLunes.weekday !== 1) {
    console.error(`La fecha ${fechaLunesStr} no es lunes. Por favor, proporciona un lunes.`);
    process.exit(1);
  }

  console.log(`Iniciando seed de fichajes para la semana del ${fechaLunesStr}`);
  console.log(`UID del trabajador: ${uid}`);

  // Conectar a PostgreSQL
  const prisma = new PrismaClient();

  try {
    // Buscar el trabajador por idApp (uid)
    const trabajador = await prisma.trabajador.findUnique({
      where: {
        idApp: uid,
      },
      select: {
        id: true,
        nombreApellidos: true,
        dni: true,
      },
    });

    if (!trabajador) {
      console.error(`No se encontró ningún trabajador con uid: ${uid}`);
      process.exit(1);
    }

    console.log(`Trabajador encontrado: ${trabajador.nombreApellidos} (DNI: ${trabajador.dni}, ID: ${trabajador.id})`);

    // Conectar a MongoDB
    const mongoHost = "mongo-cluster-d1c18377.mongo.ondigitalocean.com";
    const mongoUser = process.env.MONGO_USER;
    const mongoPass = process.env.MONGO_PASS;
    const dbName = process.env.ENTORNO === "test" ? "365equipo_test" : "365equipo";

    const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoHost}/${dbName}?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    const client = new MongoClient(uri);

    await client.connect();
    console.log(`Conectado a MongoDB (base de datos: ${dbName})`);

    const db = client.db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    // Generar fichajes para la semana (lunes a viernes)
    const fichajes: FichajeDto[] = [];
    const diasSemana = 5; // Lunes a viernes

    for (let dia = 0; dia < diasSemana; dia++) {
      const fecha = fechaLunes.plus({ days: dia });

      // Fichaje de ENTRADA (09:00)
      const horaEntrada = fecha.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
      fichajes.push({
        enviado: true,
        hora: horaEntrada.toJSDate(),
        tipo: "ENTRADA",
        uid,
        idExterno: trabajador.id,
        validado: false,
        nombre: trabajador.nombreApellidos,
        dni: trabajador.dni,
        geolocalizacion: {
          latitud: null,
          longitud: null,
        },
      });

      // Fichaje de SALIDA (18:00)
      const horaSalida = fecha.set({ hour: 18, minute: 0, second: 0, millisecond: 0 });
      fichajes.push({
        enviado: true,
        hora: horaSalida.toJSDate(),
        tipo: "SALIDA",
        uid,
        idExterno: trabajador.id,
        validado: false,
        nombre: trabajador.nombreApellidos,
        dni: trabajador.dni,
        geolocalizacion: {
          latitud: null,
          longitud: null,
        },
      });
    }

    console.log(`Insertando ${fichajes.length} fichajes (${diasSemana} días, 2 fichajes por día)...`);

    // Insertar fichajes en MongoDB
    const result = await fichajesCollection.insertMany(fichajes);
    console.log(`✅ Se insertaron ${result.insertedCount} fichajes correctamente`);

    // Cerrar conexiones
    await client.close();
    await prisma.$disconnect();

    console.log("Proceso completado exitosamente");
  } catch (error) {
    console.error("Error durante el proceso:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
