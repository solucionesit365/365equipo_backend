// database.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConnectionPool, config as SQLConfig } from "mssql";

@Injectable()
export class FacTenaMssql implements OnModuleInit, OnModuleDestroy {
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
}
