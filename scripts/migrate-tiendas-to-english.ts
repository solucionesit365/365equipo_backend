import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script para migrar la colección "tiendas" de MongoDB
 * de campos en español a campos en inglés (estándar del proyecto)
 *
 * Mapeo de campos:
 * - direccion → address
 * - CodigoPostal → postalCode
 * - Población → city
 * - Provincia → province
 * - CódMunicipio → municipalityCode
 * - nombre → name
 * - Latitud → latitude
 * - Longitud → longitude
 * - Tipo → type
 * - telefono → phone
 * - id, idExterno, coordinatorId, existsBC → sin cambios
 */

async function migrateTiendas() {
  const mongoHost = 'mongo-cluster-d1c18377.mongo.ondigitalocean.com';
  let uri: string;

  // Determinar entorno
  if (process.env.ENTORNO === 'test') {
    uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo_test?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    console.log('🔄 Migrando base de datos de TEST...');
  } else {
    uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    console.log('🔄 Migrando base de datos de PRODUCCIÓN...');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const tiendasCollection = db.collection('tiendas');

    // Obtener todas las tiendas
    const tiendas = await tiendasCollection.find({}).toArray();
    console.log(`📊 Encontradas ${tiendas.length} tiendas para migrar`);

    let migrated = 0;
    let skipped = 0;

    for (const tienda of tiendas) {
      // Verificar si ya está migrada (tiene el campo 'address' en lugar de 'direccion')
      if (tienda.address && !tienda.direccion) {
        skipped++;
        continue;
      }

      // Crear documento con nuevos campos
      const updateDoc: any = {};
      const unsetDoc: any = {};

      // Mapear campos antiguos a nuevos
      if (tienda.direccion !== undefined) {
        updateDoc.address = tienda.direccion;
        unsetDoc.direccion = '';
      }
      if (tienda.CodigoPostal !== undefined) {
        updateDoc.postalCode = tienda.CodigoPostal;
        unsetDoc.CodigoPostal = '';
      }
      if (tienda.Población !== undefined) {
        updateDoc.city = tienda.Población;
        unsetDoc.Población = '';
      }
      if (tienda.Provincia !== undefined) {
        updateDoc.province = tienda.Provincia;
        unsetDoc.Provincia = '';
      }
      if (tienda.CódMunicipio !== undefined) {
        updateDoc.municipalityCode = tienda.CódMunicipio;
        unsetDoc.CódMunicipio = '';
      }
      if (tienda.nombre !== undefined) {
        updateDoc.name = tienda.nombre;
        unsetDoc.nombre = '';
      }
      if (tienda.Latitud !== undefined) {
        updateDoc.latitude = tienda.Latitud;
        unsetDoc.Latitud = '';
      }
      if (tienda.Longitud !== undefined) {
        updateDoc.longitude = tienda.Longitud;
        unsetDoc.Longitud = '';
      }
      if (tienda.Tipo !== undefined) {
        updateDoc.type = tienda.Tipo;
        unsetDoc.Tipo = '';
      }
      if (tienda.telefono !== undefined) {
        updateDoc.phone = tienda.telefono;
        unsetDoc.telefono = '';
      }

      // Actualizar el documento
      const operations: any = {};
      if (Object.keys(updateDoc).length > 0) {
        operations.$set = updateDoc;
      }
      if (Object.keys(unsetDoc).length > 0) {
        operations.$unset = unsetDoc;
      }

      if (Object.keys(operations).length > 0) {
        await tiendasCollection.updateOne(
          { _id: tienda._id },
          operations
        );
        migrated++;
        console.log(`  ✓ Migrada tienda: ${tienda.nombre || tienda.name} (ID: ${tienda.id})`);
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`  ✅ Tiendas migradas: ${migrated}`);
    console.log(`  ⏭️  Tiendas omitidas (ya migradas): ${skipped}`);
    console.log(`  📊 Total: ${tiendas.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración
migrateTiendas()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  });
