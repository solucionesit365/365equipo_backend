import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConnectionPool, Request, config as SQLConfig, TYPES } from "mssql";

@Injectable()
export class HitMssqlService implements OnModuleInit, OnModuleDestroy {
  private pool: ConnectionPool;

  constructor() {
    const config: SQLConfig = {
      user: process.env.MSSQL_USER_HIT,
      password: process.env.MSSQL_PASS_HIT,
      server: process.env.MSSQL_HOST_HIT,
      database: "Fac_Tena",
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 10000,
      },
      requestTimeout: 10000,
    };
    this.pool = new ConnectionPool(config);
  }

  async onModuleInit(): Promise<void> {
    await this.pool.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.close();
  }

  async recHit(consultaSQL: string) {
    const result = await this.pool.request().query(consultaSQL);
    return result;
  }

  async recHitBind(query: string, ...args: any[]) {
    if (typeof query !== "string") {
      throw new Error("El argumento query debe ser de tipo string");
    }

    // Creación correcta de un objeto Request
    const request = new Request(this.pool);

    // Agregamos los parámetros al request
    args.forEach((arg, index) => {
      if (typeof arg === "string") {
        request.input(`param${index}`, TYPES.NVarChar, arg);
      } else if (typeof arg === "number") {
        request.input(`param${index}`, TYPES.Int, arg);
      } else if (arg instanceof Date) {
        request.input(`param${index}`, TYPES.DateTime, arg);
      } else {
        // Aquí puedes manejar otros tipos o lanzar un error si el tipo no es soportado
        throw new Error(
          `Tipo no soportado para el argumento en la posición ${index}`,
        );
      }
    });

    try {
      return await request.query(query);
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
      throw error;
    }
  }
}
