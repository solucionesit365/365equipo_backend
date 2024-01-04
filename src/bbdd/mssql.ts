import * as sql from "mssql";

export async function recHit(database: string, consultaSQL: string) {
  const config = {
    user: process.env.MSSQL_USER_HIT,
    password: process.env.MSSQL_PASS_HIT,
    server: process.env.MSSQL_HOST_HIT,
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

export async function recSolucionesClassic(
  database: string,
  consultaSQL: string,
) {
  const config = {
    user: process.env.MSSQL_USER_SOLUCIONES,
    password: process.env.MSSQL_PASS_SOLUCIONES,
    server: process.env.MSSQL_HOST_SOLUCIONES,
    database: database,
    connectionTimeout: 50000,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 20000,
    },
    requestTimeout: 20000,
  };

  // console.log(consultaSQL);
  const pool = await new sql.ConnectionPool(config).connect();
  const result = await pool.request().query(consultaSQL);
  pool.close();
  return result;
}

export async function recSolucionesClassicNew(consultaSQL: string) {
  const config = {
    user: process.env.MSSQL_USER_SOLUCIONES,
    password: process.env.MSSQL_PASS_SOLUCIONES,
    server: process.env.MSSQL_HOST_SOLUCIONES,
    connectionTimeout: 50000,
    database: process.env.ENTORNO === "test" ? "test_soluciones" : "soluciones",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 20000,
    },
    requestTimeout: 20000,
  };

  // console.log(consultaSQL);
  const pool = await new sql.ConnectionPool(config).connect();
  const result = await pool.request().query(consultaSQL);
  pool.close();
  return result;
}

export async function recSoluciones(
  database: string,
  query: string,
  ...args: any[]
) {
  const config = {
    user: process.env.MSSQL_USER_SOLUCIONES,
    password: process.env.MSSQL_PASS_SOLUCIONES,
    server: process.env.MSSQL_HOST_SOLUCIONES,
    connectionTimeout: 50000,
    database: database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 20000,
    },
    requestTimeout: 20000,
  };

  const connectionPool = new sql.ConnectionPool(config);

  try {
    if (typeof query !== "string") {
      throw new Error("El argumento query debe ser de tipo string");
    }

    await connectionPool.connect();
    const request = new sql.Request(connectionPool);

    for (let i = 0; i < args.length; i++) {
      request.input(`param${i}`, args[i]);
    }

    return await request.query(query);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    console.log(query);
    throw error;
  } finally {
    await connectionPool.close();
  }
}

/* Cuadrantes 2.0 */
export async function recSolucionesNew(query: string, ...args: any[]) {
  const config = {
    user: process.env.MSSQL_USER_SOLUCIONES,
    password: process.env.MSSQL_PASS_SOLUCIONES,
    server: process.env.MSSQL_HOST_SOLUCIONES,
    connectionTimeout: 50000,
    database: process.env.ENTORNO === "test" ? "test_soluciones" : "soluciones",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 20000,
    },
    requestTimeout: 20000,
  };

  const connectionPool = new sql.ConnectionPool(config);

  try {
    if (typeof query !== "string") {
      throw new Error("El argumento query debe ser de tipo string");
    }

    await connectionPool.connect();
    const request = new sql.Request(connectionPool);

    for (let i = 0; i < args.length; i++) {
      request.input(`param${i}`, args[i]);
    }

    return await request.query(query);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    console.log(query);
    throw error;
  } finally {
    await connectionPool.close();
  }
}

export async function recHitBind(
  database: string,
  query: string,
  ...args: any[]
) {
  const config = {
    user: process.env.MSSQL_USER_HIT,
    password: process.env.MSSQL_PASS_HIT,
    server: process.env.MSSQL_HOST_HIT,
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

  const connectionPool = new sql.ConnectionPool(config);

  try {
    if (typeof query !== "string") {
      throw new Error("El argumento query debe ser de tipo string");
    }

    await connectionPool.connect();
    const request = new sql.Request(connectionPool);

    for (let i = 0; i < args.length; i++) {
      request.input(`param${i}`, args[i]);
    }

    return await request.query(query);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    console.log(query);
    throw error;
  } finally {
    await connectionPool.close();
  }
}

export async function getConnectionPoolHit() {
  const config = {
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

  const pool = await new sql.ConnectionPool(config).connect();
  return pool;
}
