import * as sql from "mssql";
import * as secrets from "../../secrets";

export async function recHit(database: string, consultaSQL: string) {
  const config = {
    user: secrets.MSSQL_USER_HIT,
    password: secrets.MSSQL_PASS_HIT,
    server: secrets.MSSQL_HOST_HIT,
    database: database,
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

  const pool = await new sql.ConnectionPool(config).connect();
  const result = await pool.request().query(consultaSQL);
  pool.close();
  return result;
}

export async function recSoluciones(database: string, consultaSQL: string) {
  const config = {
    user: process.env.MSSQL_USER_SOLUCIONES,
    password: process.env.MSSQL_PASS_SOLUCIONES,
    server: process.env.MSSQL_HOST_SOLUCIONES,
    database: database,
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

  // console.log(consultaSQL);
  const pool = await new sql.ConnectionPool(config).connect();
  const result = await pool.request().query(consultaSQL);
  pool.close();
  return result;
}
