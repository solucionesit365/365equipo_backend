"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
async function migrateTiendas() {
    const mongoHost = 'mongo-cluster-d1c18377.mongo.ondigitalocean.com';
    let uri;
    if (process.env.ENTORNO === 'test') {
        uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo_test?tls=true&authSource=admin&replicaSet=mongo-cluster`;
        console.log('🔄 Migrando base de datos de TEST...');
    }
    else {
        uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo?tls=true&authSource=admin&replicaSet=mongo-cluster`;
        console.log('🔄 Migrando base de datos de PRODUCCIÓN...');
    }
    const client = new mongodb_1.MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB');
        const db = client.db();
        const tiendasCollection = db.collection('tiendas');
        const tiendas = await tiendasCollection.find({}).toArray();
        console.log(`📊 Encontradas ${tiendas.length} tiendas para migrar`);
        let migrated = 0;
        let skipped = 0;
        for (const tienda of tiendas) {
            if (tienda.address && !tienda.direccion) {
                skipped++;
                continue;
            }
            const updateDoc = {};
            const unsetDoc = {};
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
            const operations = {};
            if (Object.keys(updateDoc).length > 0) {
                operations.$set = updateDoc;
            }
            if (Object.keys(unsetDoc).length > 0) {
                operations.$unset = unsetDoc;
            }
            if (Object.keys(operations).length > 0) {
                await tiendasCollection.updateOne({ _id: tienda._id }, operations);
                migrated++;
                console.log(`  ✓ Migrada tienda: ${tienda.nombre || tienda.name} (ID: ${tienda.id})`);
            }
        }
        console.log('\n📈 Resumen de migración:');
        console.log(`  ✅ Tiendas migradas: ${migrated}`);
        console.log(`  ⏭️  Tiendas omitidas (ya migradas): ${skipped}`);
        console.log(`  📊 Total: ${tiendas.length}`);
    }
    catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
    finally {
        await client.close();
        console.log('🔌 Desconectado de MongoDB');
    }
}
migrateTiendas()
    .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate-tiendas-to-english.js.map