import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { Tienda } from "./tiendas.dto";
import { recHit } from "../bbdd/mssql";

@Injectable()
export class tiendasMongodb {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async getTiendas() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const tiendas = db.collection<Tienda>("tiendas");

    return await tiendas.find({}).sort({ nombre: 1 }).toArray();
  }

  async getTiendasHitMongoDb() {
    try {
      // Paso 1: Obtener datos de MSSQL usando recHit
      const tiendasMssql = await recHit(
        "Fac_Tena",
        `
          select 
            cli.Codi as id, 
            LOWER(cli.nom) as nombre, 
            cli.adresa as direccion 
          from paramsHw ph 
          left join clients cli ON cli.Codi = ph.Valor1 
          where 
            cli.nom NOT LIKE '%antigua%' AND 
            cli.nom NOT LIKE '%vieja%' AND 
            cli.nom NOT LIKE '%no%' AND 
            cli.codi IS NOT NULL 
          order by cli.nom
        `,
      );

      // Verificar si se obtuvieron datos
      if (
        !tiendasMssql ||
        !tiendasMssql.recordset ||
        tiendasMssql.recordset.length === 0
      ) {
        console.log("No se encontraron tiendas en MSSQL");
        return false;
      }

      // Paso 2: Transformar los datos para MongoDB
      const tiendasParaMongo = tiendasMssql.recordset.map((tienda) => ({
        id: tienda.id,
        idExterno: tienda.id,
        nombre: tienda.nombre,
        direccion: tienda.direccion,
      }));

      // Asegúrate de que tiendasParaMongo es un array
      if (!Array.isArray(tiendasParaMongo)) {
        console.error("tiendasParaMongo no es un array");
        return [];
      }
      return tiendasParaMongo;
    } catch (error) {
      console.error("Error al obtener o insertar tiendas:", error);
      return false;
    }
  }

  async addTiendasNuevasMongoDb(nuevasTiendas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const tiendas = db.collection<Tienda>("tiendas");

    const documentos = nuevasTiendas.map((tienda) => ({
      id: tienda.id,
      nombre: tienda.nombre,
      direccion: tienda.direccion,
      idExterno: tienda.id,
    }));

    const resultado = await tiendas.insertMany(documentos);
    return resultado.insertedCount === nuevasTiendas.length;
  }
}
