import {
  recHit,
  recSoluciones,
  recSolucionesClassic,
  recSolucionesNew,
} from "../bbdd/mssql";
import { TrabajadorCompleto, TrabajadorSql } from "./trabajadores.interface";
import * as moment from "moment";
import { DateTime } from "luxon";

const GET_DATOS_TRABAJADOR = `
tr.id,
tr.idApp,
tr.nombreApellidos,
tr.displayName,
tr.emails,
tr.dni,
tr.direccion,
tr.ciudad,
tr.telefonos,
CONVERT(nvarchar, tr.fechaNacimiento, 103) as fechaNacimiento,
tr.nacionalidad,
tr.nSeguridadSocial,
tr.codigoPostal,
tr.cuentaCorriente,
tr.tipoTrabajador,
CONVERT(nvarchar, tr.inicioContrato, 103) as inicioContrato,
CONVERT(nvarchar, tr.finalContrato, 103) as finalContrato,
tr.idResponsable,
tr.idTienda,
(SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
(SELECT top 1 horasContrato*40/100 FROM historicoContratos WHERE dni = tr.dni
AND inicioContrato <= GETDATE() AND (fechaBaja >= GETDATE() OR fechaBaja IS NULL)
) as horasContrato,
tr1.nombreApellidos as nombreResponsable,
ti.nombre as nombreTienda,
CONVERT(nvarchar, tr.antiguedad, 103) as antiguedad,
tr.idEmpresa,
tr.tokenQR,
tr.displayFoto
`;

/* Todos */
export async function getTrabajadores(todos = false) {
  const sql = `
    SELECT 
        ${GET_DATOS_TRABAJADOR}
    FROM trabajadores tr
    LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
    LEFT JOIN tiendas ti ON tr.idTienda = ti.id
    ${
      !todos
        ? "WHERE tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL"
        : ""
    } ORDER BY nombreApellidos
    `;
  const resUsuarios = await recSoluciones("soluciones", sql);

  if (resUsuarios.recordset.length > 0)
    return resUsuarios.recordset as TrabajadorSql[];
  return null;
}

// Identificar usuario QR

export async function getTrabajadorTokenQR(
  idTrabajador: number,
  tokenQR: string,
) {
  const sql = `
  SELECT 
  tr.nombreApellidos,
  tr.tipoTrabajador
  FROM trabajadores tr
  WHERE tr.id = @param0 AND tr.tokenQR = @param1
  `;
  const resTrabajador = await recSoluciones(
    "soluciones",
    sql,
    idTrabajador,
    tokenQR,
  );
  if (resTrabajador.recordset.length > 0)
    return resTrabajador.recordset[0] as TrabajadorSql;
  return null;
}

export async function getTrabajadoresByTienda(idTienda: number) {
  const sql = "select * from trabajadores where idTienda = @param0";
  const resTrabajador = await recSoluciones("soluciones", sql, idTienda);
  if (resTrabajador.recordset.length > 0) return resTrabajador.recordset;
  return null;
}

/* Individual x uid */
export async function getTrabajadorByAppId(uid: string) {
  const sql = `

  SELECT 
    ${GET_DATOS_TRABAJADOR}
  FROM trabajadores tr
  LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
  LEFT JOIN tiendas ti ON tr.idTienda = ti.id
  WHERE tr.idApp = @param0 AND tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL ORDER BY nombreApellidos
`;
  const resUser = await recSoluciones("soluciones", sql, uid);

  if (resUser.recordset.length > 0)
    return resUser.recordset[0] as TrabajadorSql;
  return null;
}

/* Individual x sqlId, la consulta debe ser igual a getTrabajadorByAppId pero con el id*/
export async function getTrabajadorBySqlId(id: number) {
  const sql = `

  SELECT 
    ${GET_DATOS_TRABAJADOR}
  FROM trabajadores tr
  LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
  LEFT JOIN tiendas ti ON tr.idTienda = ti.id
  WHERE tr.id = @param0 AND tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL ORDER BY nombreApellidos
`;
  const resUser = await recSoluciones("soluciones", sql, id);

  if (resUser.recordset.length > 0)
    return resUser.recordset[0] as TrabajadorSql;
  return null;
}

export async function getTrabajadorByDni(dni: string) {
  const sql = `

  SELECT 
    ${GET_DATOS_TRABAJADOR}
  FROM trabajadores tr
  LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
  LEFT JOIN tiendas ti ON tr.idTienda = ti.id
  WHERE tr.dni = @param0 AND tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL 
  ORDER BY nombreApellidos
`;
  const resUser = await recSoluciones("soluciones", sql, dni);

  if (resUser.recordset.length > 0)
    return resUser.recordset[0] as TrabajadorSql;
  return null;
}

export async function getSubordinadosConTienda(
  idAppResponsable: string,
): Promise<any[]> {
  const sql = `
  SELECT 
    tr.*, 
    (select count(*) from trabajadores where idResponsable = tr.id) as llevaEquipo,
    (select idApp from trabajadores where id = tr.idResponsable) as validador,
    (select nombre from tiendas where id = tr.idTienda) as nombreTienda
  FROM trabajadores tr
  WHERE 
    tr.idResponsable = (select id from trabajadores where idApp = @param0) 
    AND tr.idTienda is not null
    `;
  const resTrabajadores = await recSoluciones(
    "soluciones",
    sql,
    idAppResponsable,
  );
  if (resTrabajadores.recordset.length > 0) return resTrabajadores.recordset;
  return [];
}

export async function getSubordinadosConTiendaPorId(
  idResponsable: number,
): Promise<any[]> {
  const sql = `
  SELECT 
    tr.*, 
    (select count(*) from trabajadores where idResponsable = tr.id) as llevaEquipo,
    (select idApp from trabajadores where id = tr.idResponsable) as validador,
    (select nombre from tiendas where id = tr.idTienda) as nombreTienda
  FROM trabajadores tr
  WHERE 
    tr.idResponsable = @param0 
    AND tr.idTienda is not null
  `;
  const resTrabajadores = await recSoluciones("soluciones", sql, idResponsable);
  if (resTrabajadores.recordset.length > 0) return resTrabajadores.recordset;
  return [];
}

export async function esCoordinadora(uid: string) {
  const sql = `
    SELECT 
      tr.idTienda,
      tr.idResponsable,
      (select idApp from trabajadores where id = tr.idResponsable) as idResponsableApp,
      (select count(*) from trabajadores where idResponsable = tr.id) as llevaEquipo 
    from trabajadores tr where idApp = @param0;
  `;
  const resCoordi = await recSoluciones("soluciones", sql, uid);

  if (resCoordi.recordset.length > 0) return true;
  return false;
}

export async function esCoordinadoraPorId(id: number) {
  const sql = `
    SELECT 
      tr.idTienda,
      tr.idResponsable,
      (select idApp from trabajadores where id = tr.idResponsable) as idResponsableApp,
      (select count(*) from trabajadores where idResponsable = tr.id) as llevaEquipo 
    from trabajadores tr where id = @param0;
  `;
  const resCoordi = await recSoluciones("soluciones", sql, id);

  if (resCoordi.recordset.length > 0) return true;
  return false;
}

export async function getSubordinados(uid: string): Promise<
  {
    id: number;
    idApp: string;
    nombreApellidos: string;
    displayName: string;
    displayfoto: string;
    idTienda: number;
    antiguedad: string;
    inicioContrato: string;
  }[]
> {
  const sql = `
    select 
      id, 
      idApp, 
      nombreApellidos, 
      displayName,
      displayFoto,
      idTienda, 
      CONVERT(varchar, antiguedad, 103) as antiguedad, 
      CONVERT(varchar, inicioContrato, 103) as inicioContrato 
    from trabajadores 
    where idResponsable = (select id from trabajadores where idApp = @param0)
  `;
  const resSubordinados = await recSoluciones("soluciones", sql, uid);
  if (resSubordinados.recordset.length > 0) return resSubordinados.recordset;
  return [];
}

export async function getSubordinadosByIdsql(id: number): Promise<
  {
    id: number;
    idApp: string;
    nombreApellidos: string;
    displayName: string;
    displayfoto: string;
    idTienda: number;
    antiguedad: string;
    inicioContrato: string;
  }[]
> {
  const sql = `
    select 
      id, 
      idApp, 
      nombreApellidos, 
      displayName,
      displayFoto,
      idTienda, 
      CONVERT(varchar, antiguedad, 103) as antiguedad, 
      CONVERT(varchar, inicioContrato, 103) as inicioContrato 
    from trabajadores 
    where idResponsable = @param0
  `;
  const resSubordinados = await recSoluciones("soluciones", sql, id);
  if (resSubordinados.recordset.length > 0) return resSubordinados.recordset;
  return [];
}

// export async function getSubordinadosById(id: number, conFecha?: moment.Moment): Promise<
//   {
//     id: number;
//     idApp: string;
//     nombreApellidos: string;
//     idTienda: number;
//     antiguedad: string;
//     inicioContrato: string;
//     horasContrato: number;
//   }[]
// > {
//   const sql = `
//     select
//       tr.id,
//       tr.idApp,
//       tr.nombreApellidos,
//       tr.idTienda,
//       CONVERT(varchar, tr.antiguedad, 103) as antiguedad,
//       CONVERT(varchar, tr.inicioContrato, 103) as inicioContrato,
//       (SELECT top 1 horasContrato*40/100 FROM historicoContratos WHERE dni = tr.dni)  as horasContrato
//     from trabajadores tr
//     where idResponsable = @param0
//   `;
//   const resSubordinados = await recSoluciones("soluciones", sql, id);
//   if (resSubordinados.recordset.length > 0) return resSubordinados.recordset;
//   return [];
// }

export async function getSubordinadosById(
  id: number,
  conFecha?: moment.Moment,
): Promise<
  {
    id: number;
    idApp: string;
    nombreApellidos: string;
    idTienda: number;
    antiguedad: string;
    inicioContrato: string;
    horasContrato: number;
  }[]
> {
  let sql = `
    select 
      tr.id, 
      tr.idApp, 
      tr.nombreApellidos, 
      tr.idTienda, 
      CONVERT(varchar, tr.antiguedad, 103) as antiguedad, 
      CONVERT(varchar, tr.inicioContrato, 103) as inicioContrato,
      (SELECT top 1 horasContrato*40/100 FROM historicoContratos WHERE dni = tr.dni
  `;

  if (conFecha) {
    sql += ` AND inicioContrato <= @param1 AND (fechaBaja >= @param1 OR fechaBaja IS NULL)`;
  }

  sql += `) as horasContrato from trabajadores tr where idResponsable = @param0`;

  const resSubordinados = await recSoluciones(
    "soluciones",
    sql,
    id,
    conFecha ? conFecha.format("YYYY-MM-DD HH:mm:ss") : undefined,
  );
  if (resSubordinados.recordset.length > 0) return resSubordinados.recordset;
  return [];
}

export async function getSubordinadosByIdNew(
  id: number,
  conFecha?: DateTime,
): Promise<
  {
    id: number;
    idApp: string;
    nombreApellidos: string;
    idTienda: number;
    antiguedad: string;
    inicioContrato: string;
    horasContrato: number;
  }[]
> {
  let sql = `
    select 
      tr.id, 
      tr.idApp, 
      tr.nombreApellidos, 
      tr.idTienda, 
      CONVERT(varchar, tr.antiguedad, 103) as antiguedad, 
      CONVERT(varchar, tr.inicioContrato, 103) as inicioContrato,
      (SELECT top 1 horasContrato*40/100 FROM historicoContratos WHERE dni = tr.dni
  `;

  if (conFecha) {
    sql += ` AND inicioContrato <= @param1 AND (fechaBaja >= @param1 OR fechaBaja IS NULL)`;
  }

  sql += `) as horasContrato from trabajadores tr where idResponsable = @param0`;

  const resSubordinados = await recSolucionesNew(
    sql,
    id,
    conFecha ? conFecha.toSQL({ includeOffset: false }) : undefined,
  );
  if (resSubordinados.recordset.length > 0) return resSubordinados.recordset;
  return [];
}

export async function getHorasContrato(idSql: number, conFecha: moment.Moment) {
  const sql = `
    SELECT top 1 horasContrato*40/100 as horasContrato
    FROM historicoContratos 
    WHERE 
      dni = (select dni from trabajadores where id = @param0) AND 
      inicioContrato <= @param1 AND 
      (fechaBaja >= @param1 OR fechaBaja IS NULL)
  `;

  const resSubordinados = await recSoluciones(
    "soluciones",
    sql,
    idSql,
    conFecha ? conFecha.format("YYYY-MM-DD HH:mm:ss") : undefined,
  );

  return resSubordinados.recordset[0]?.horasContrato;
}

/* Cuadrantes 2.0 */
export async function getHorasContratoNew(idSql: number, conFecha: DateTime) {
  const sql = `
    SELECT top 1 horasContrato*40/100 as horasContrato
    FROM historicoContratos 
    WHERE 
      dni = (select dni from trabajadores where id = @param0) AND 
      inicioContrato <= @param1 AND 
      (fechaBaja >= @param1 OR fechaBaja IS NULL)
  `;

  const resSubordinados = await recSolucionesNew(
    sql,
    idSql,
    conFecha ? conFecha.toSQL({ includeOffset: false }) : undefined,
  );

  return resSubordinados.recordset[0]?.horasContrato;
}

export async function getTrabajadoresSage(): Promise<
  {
    id: number;
    nombreApellidos: string;
    displayName: string;
    emails: string;
    dni: string;
    direccion: string;
    ciudad: string;
    telefonos: string;
    fechaNacimiento: string;
    nacionalidad: string;
    nSeguridadSocial: string;
    codigoPostal: string;
    cuentaCorriente: string;
    tipoTrabajador: string;
    inicioContrato: string;
    finalContrato: string;
    antiguedad: string;
    idEmpresa: number;
  }[]
> {
  const sqlQuery = ` 
	WITH CTE_Resultado AS (
    SELECT
      de.CODI as id,
      de.NOM as nombreApellidos,
      de.MEMO as displayName,
    de2.valor as emails,
      pe.Dni as dni,
    de3.valor as direccion,
    de4.valor as ciudad,
    de5.valor as telefonos,
    de6.valor as fechaNacimiento,
    de7.valor as nacionalidad,
      pe.ProvNumSoe as nSeguridadSocial,
    de8.valor as codigoPostal,
      ec.IBANReceptor as cuentaCorriente,
    de9.valor as tipoTrabajador,
      CONVERT(nvarchar, en.FechaAlta, 103) as inicioContrato,
      CONVERT(nvarchar, en.FechaBaja, 103) as finalContrato,
      CONVERT(nvarchar, en.FechaAntiguedad, 103) as antiguedad,
      en.CodigoEmpresa as idEmpresa,
      ROW_NUMBER() OVER (PARTITION BY pe.Dni ORDER BY (SELECT NULL)) AS RowNumber
    FROM silema_ts.sage.dbo.Personas pe
    LEFT JOIN silema_ts.sage.dbo.EmpleadoCobro ec ON pe.dni = ec.IDBeneficiario
    LEFT JOIN silema_ts.sage.dbo.EmpleadoNomina en ON pe.dni = en.Dni
    LEFT JOIN silema_ts.sage.dbo.Empresas em ON em.CodigoEmpresa = en.CodigoEmpresa
    LEFT JOIN dependentesExtes de1 ON de1.nom = 'DNI' AND de1.valor COLLATE SQL_Latin1_General_CP1_CI_AS = pe.Dni
    LEFT JOIN dependentesExtes de2 ON de1.id = de2.id AND de2.nom = 'EMAIL'
    LEFT JOIN dependentesExtes de3 ON de1.id = de3.id AND de3.nom = 'ADRESA'
    LEFT JOIN dependentesExtes de4 ON de1.id = de4.id AND de4.nom = 'CIUTAT'
    LEFT JOIN dependentesExtes de5 ON de1.id = de5.id AND de5.nom = 'TLF_MOBIL'
    LEFT JOIN dependentesExtes de6 ON de1.id = de6.id AND de6.nom = 'DATA_NAIXEMENT'
    LEFT JOIN dependentesExtes de7 ON de1.id = de7.id AND de7.nom = 'NACIONALITAT'
    LEFT JOIN dependentesExtes de8 ON de1.id = de8.id AND de8.nom = 'CODIGO POSTAL'
    LEFT JOIN dependentesExtes de9 ON de1.id = de9.id AND de9.nom = 'TIPUSTREBALLADOR'
    LEFT JOIN dependentes de ON de.CODI = de1.id
    
  
    WHERE 
    en.FechaAlta IS NOT NULL AND en.FechaBaja IS NULL
    AND en.CodigoEmpresa IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15) 
    AND de.CODI IS NOT NULL 
  )
  SELECT *
  FROM CTE_Resultado
  WHERE RowNumber = 1
  ORDER BY nombreApellidos;
  
`;
  const resTrabajadores = await recHit("Fac_Tena", sqlQuery);
  if (resTrabajadores.recordset.length > 0) return resTrabajadores.recordset;
  else throw Error("Error, no hay trabajadores");
}

export async function setIdApp(idSql: number, uid: string) {
  const sql = "UPDATE trabajadores SET idApp = @param0 WHERE id = @param1";
  await recSoluciones("soluciones", sql, uid, idSql);
}

function convertOrNULL(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  return `CONVERT(datetime, '${value}', 103)`;
}

function isValidDate(value) {
  return moment(value, "DD/MM/YYYY").isValid();
}

function isValidUsuario(usuario) {
  return (
    isValidDate(usuario.inicioContrato) &&
    isValidDate(usuario.antiguedad) &&
    usuario.dni &&
    usuario.dni !== "" &&
    usuario.telefonos &&
    usuario.telefonos !== ""
  );
}

async function executeBatch(database: string, batch, queryBuilder) {
  const query = batch.map(queryBuilder).join(";");
  await recSolucionesClassic(database, query);
}

export async function actualizarUsuarios(
  database: string,
  usuariosNuevos,
  modificarEnApp,
) {
  try {
    const usuariosNoActualizadosNuevos = [];
    const usuariosNoActualizadosApp = [];

    // INSERT
    const usuariosNuevosValidos = usuariosNuevos.filter((usuario) => {
      const isValid = isValidUsuario(usuario) && !usuario.finalContrato;
      if (!isValid) usuariosNoActualizadosNuevos.push(usuario);
      return isValid;
    });

    // UPDATE
    const modificarEnAppValidos = modificarEnApp.filter((usuario) => {
      const isValid = isValidUsuario(usuario);
      if (!isValid) usuariosNoActualizadosApp.push(usuario);
      return isValid;
    });

    const batchSize = 100; // Ajusta este valor según las necesidades de rendimiento

    const insertQueryBuilder = (usuario) => `
      INSERT INTO dbo.trabajadores (
        id, idApp, nombreApellidos, displayName, emails, dni, direccion, ciudad,
        telefonos, fechaNacimiento, nacionalidad, nSeguridadSocial, codigoPostal,
        cuentaCorriente, tipoTrabajador, inicioContrato, finalContrato, antiguedad, idEmpresa
      ) VALUES (
        ${usuario.id},
        ${usuario.idApp ? `'${usuario.idApp}'` : "NULL"},
        ${usuario.nombreApellidos ? `'${usuario.nombreApellidos}'` : "NULL"},
        ${usuario.displayName ? `'${usuario.displayName}'` : "NULL"},
        ${usuario.emails ? `'${usuario.emails}'` : "NULL"},
        ${usuario.dni ? `'${usuario.dni}'` : "NULL"},
        ${usuario.direccion ? `'${usuario.direccion}'` : "NULL"},
        ${usuario.ciudad ? `'${usuario.ciudad}'` : "NULL"},
        ${usuario.telefonos ? `'${usuario.telefonos}'` : "NULL"},
        ${convertOrNULL(usuario.fechaNacimiento)},
        ${usuario.nacionalidad ? `'${usuario.nacionalidad}'` : "NULL"},
        ${usuario.nSeguridadSocial ? `'${usuario.nSeguridadSocial}'` : "NULL"},
        ${usuario.codigoPostal ? `'${usuario.codigoPostal}'` : "NULL"},
        ${usuario.cuentaCorriente ? `'${usuario.cuentaCorriente}'` : "NULL"},
        ${usuario.tipoTrabajador ? `'${usuario.tipoTrabajador}'` : "NULL"},
        ${convertOrNULL(usuario.inicioContrato)},
        ${convertOrNULL(usuario.finalContrato)},
        ${convertOrNULL(usuario.antiguedad)},
        ${usuario.idEmpresa ? `'${usuario.idEmpresa}'` : "NULL"}
      )`;

    const updateQueryBuilder = (usuario) => `
      UPDATE dbo.trabajadores
      SET
        dni = ${usuario.dni ? `'${usuario.dni}'` : "NULL"},
        inicioContrato = ${convertOrNULL(usuario.inicioContrato)},
        finalContrato = ${convertOrNULL(usuario.finalContrato)},
        antiguedad = ${convertOrNULL(usuario.antiguedad)},
        idEmpresa = ${usuario.idEmpresa ? `'${usuario.idEmpresa}'` : "NULL"}
      WHERE id = ${usuario.id}`;

    const promises = [];

    for (let i = 0; i < usuariosNuevosValidos.length; i += batchSize) {
      const batch = usuariosNuevosValidos.slice(i, i + batchSize);
      promises.push(executeBatch(database, batch, insertQueryBuilder));
    }

    for (let i = 0; i < modificarEnAppValidos.length; i += batchSize) {
      const batch = modificarEnAppValidos.slice(i, i + batchSize);
      promises.push(executeBatch(database, batch, updateQueryBuilder));
    }

    await Promise.all(promises);

    return {
      usuariosNoActualizadosNuevos,
      usuariosNoActualizadosApp,
    };
  } catch (error) {
    console.error("Error al actualizar usuarios:", error);
  }
}

export async function eliminarUsuarios(arrayUsuarios) {
  let sql = "";

  for (let i = 0; i < arrayUsuarios.length; i += 1) {
    if (arrayUsuarios[i].id && arrayUsuarios[i].id != 999999)
      sql += `DELETE FROM trabajadores WHERE id = ${arrayUsuarios[i].id};`;
  }

  await recSolucionesClassic("soluciones", sql);
}

export async function getResponsableTienda(idTienda: number) {
  const sql = `
    SELECT top 1 tr1.* FROM trabajadores tr1 WHERE tr1.idTienda = @param0 AND (SELECT count(*) FROM trabajadores tr2 WHERE tr1.id = tr2.idResponsable) > 0
  `;

  const resResponsable = await recSoluciones("soluciones", sql, idTienda);

  if (resResponsable.recordset.length > 0) return resResponsable.recordset[0];
  return null;
}

export function sqlHandleCambios(
  modificado: TrabajadorCompleto,
  original: TrabajadorCompleto,
) {
  let sql = "";

  if (modificado.idResponsable != original.idResponsable) {
    if (modificado.idTienda != original.idTienda)
      throw Error("No es posible cambiar el responsable y la tienda a la vez");

    if (original.coordinadora && !modificado.coordinadora) {
      sql += `
        UPDATE trabajadores SET idResponsable = null WHERE idResponsable = ${modificado.id};
      `;
    } else if (modificado.coordinadora && modificado.idTienda) {
      sql += `
      UPDATE trabajadores SET idResponsable = ${modificado.id} WHERE idTienda = ${modificado.idTienda} AND id <> ${modificado.id} AND (coordinadora IS NULL OR coordinadora = 0);
      `;
    }
  } else if (modificado.idTienda != original.idTienda) {
    if (modificado.coordinadora && original.coordinadora) {
      sql += `
        UPDATE trabajadores SET idResponsable = null WHERE idResponsable = ${modificado.id};
        UPDATE trabajadores SET idResponsable = ${modificado.id} WHERE idTienda = ${modificado.idTienda} AND id <> ${modificado.id} AND (coordinadora IS NULL OR coordinadora = 0);
        -- FALTA (C)
      `;
    }
  } else if (modificado.coordinadora && modificado.idTienda) {
    sql += `
    UPDATE trabajadores SET idResponsable = ${modificado.id} WHERE idTienda = ${modificado.idTienda} AND id <> ${modificado.id} AND (coordinadora IS NULL OR coordinadora = 0);
  `;
  } else if (!modificado.coordinadora && original.coordinadora) {
    sql += `
      UPDATE trabajadores SET idResponsable = null WHERE idResponsable = ${modificado.id};
  `;
  }

  return sql;
}

export async function guardarCambiosForm(
  trabajador: TrabajadorCompleto,
  original: TrabajadorCompleto,
) {
  let sql = "";
  sql += sqlHandleCambios(trabajador, original);
  sql += `
    UPDATE trabajadores SET
    nombreApellidos = ${
      trabajador.nombreApellidos ? `'${trabajador.nombreApellidos}'` : "NULL"
    },
    displayName = ${
      trabajador.displayName ? `'${trabajador.displayName}'` : "NULL"
    },
    emails = ${trabajador.emails ? `'${trabajador.emails}'` : "NULL"},
    dni = ${trabajador.dni ? `'${trabajador.dni}'` : "NULL"},
    direccion = ${trabajador.direccion ? `'${trabajador.direccion}'` : "NULL"},
    ciudad = ${trabajador.ciudad ? `'${trabajador.ciudad}'` : "NULL"},
    telefonos = ${trabajador.telefonos ? `'${trabajador.telefonos}'` : "NULL"},
    fechaNacimiento = convert(datetime, ${
      trabajador.fechaNacimiento ? "'" + trabajador.fechaNacimiento + "'" : null
    }, 103),
    nacionalidad = ${
      trabajador.nacionalidad ? `'${trabajador.nacionalidad}'` : "NULL"
    },
    nSeguridadSocial = ${
      trabajador.nSeguridadSocial ? `'${trabajador.nSeguridadSocial}'` : "NULL"
    },
    codigoPostal = ${
      trabajador.codigoPostal ? `'${trabajador.codigoPostal}'` : "NULL"
    },
    cuentaCorriente = ${
      trabajador.cuentaCorriente ? `'${trabajador.cuentaCorriente}'` : "NULL"
    },
    tipoTrabajador = ${
      trabajador.tipoTrabajador ? `'${trabajador.tipoTrabajador}'` : "NULL"
    },
    idResponsable = ${
      trabajador.idResponsable ? `'${trabajador.idResponsable}'` : "NULL"
    },
    idTienda = ${trabajador.idTienda ? `'${trabajador.idTienda}'` : "NULL"},
    coordinadora = ${trabajador.coordinadora ? 1 : 0},
    tokenQR = ${trabajador.tokenQR ? `'${trabajador.tokenQR}'` : "NULL"}
    WHERE id = ${trabajador.id}
  `;

  await recSolucionesClassic("soluciones", sql);
  return true;
}

export async function getNivelMenosUno(idSql: number) {
  const sqlSuResponsable = `
  IF EXISTS (SELECT * from trabajadores where id = (select idResponsable from trabajadores where id = @param0))
      BEGIN
          SELECT * from trabajadores where id = (select idResponsable from trabajadores where id = @param0)
      END
  ELSE
      BEGIN
          SELECT 'Sin responsable' as resultado
      END
  `;
  const resSuResponsable = await recSoluciones(
    "soluciones",
    sqlSuResponsable,
    idSql,
  );

  if (
    resSuResponsable.recordset?.length > 0 &&
    resSuResponsable.recordset[0]?.resultado != "Sin responsable"
  ) {
    return resSuResponsable.recordset[0];
  } else return null;
}

export async function getNivelUno(idSql: number) {
  const sql = `
    SELECT tr.*, ti.nombre as nombreTienda FROM trabajadores tr 
    LEFT JOIN tiendas ti ON tr.idTienda = ti.id
    WHERE tr.idResponsable = @param0
  `;
  const resNivelUno = await recSoluciones("soluciones", sql, idSql);

  if (resNivelUno.recordset?.length > 0) return resNivelUno.recordset;
  return null;
}

export async function getNivelCero(idSql: number) {
  const sql = `
    SELECT tr.*, ti.nombre as nombreTienda FROM trabajadores tr
    LEFT JOIN tiendas ti ON tr.idTienda = ti.id
    WHERE tr.id = @param0
  `;

  const resNivelCero = await recSoluciones("soluciones", sql, idSql);

  if (resNivelCero.recordset?.length > 0) return resNivelCero.recordset[0];
  return null;
}

export async function borrarTrabajador(idSql: number) {
  const sql = "DELETE FROM trabajadores WHERE id = @param0";

  await recSoluciones("soluciones", sql, idSql);

  return true;
}

export async function getCoordinadoras() {
  const sql = `select * from trabajadores where coordinadora = 1 AND idTienda IS NOT NULL`;

  const recCoordi = await recSoluciones("soluciones", sql);
  console.log(recCoordi);

  return recCoordi.recordset;
}

async function getHistoriaContratos(): Promise<
  {
    horasContrato: number;
    dni: string;
    inicioContrato: string;
    finalContrato: string;
    fechaAlta: string;
    fechaAntiguedad: string;
    fechaBaja: string;
  }[]
> {
  const sql = `
  SELECT 
    PorJornada as horasContrato, 
    Dni as dni, 
    CONVERT(nvarchar, FechaInicioContrato, 103) as inicioContrato, 
    CONVERT(nvarchar, FechaFinalContrato, 103) as finalContrato, 
    CONVERT(nvarchar, FechaAlta, 103) as fechaAlta, 
    CONVERT(nvarchar, FechaAntiguedad, 103) as fechaAntiguedad,
    CONVERT(nvarchar, FechaBaja, 103) as fechaBaja
  FROM silema_ts.sage.dbo.EmpleadoNomina`;

  const resHisContratos = await recHit("Fac_Tena", sql);

  if (resHisContratos.recordset.length > 0) return resHisContratos.recordset;
  return [];
}

function convertToDate(dateString) {
  if (!dateString) {
    return "NULL";
  }

  const [day, month, year] = dateString.split("/");
  const sqlDate = `${year}${month}${day}`;

  return `CONVERT(datetime, '${sqlDate}', 112)`;
}

export async function copiarHistoriaContratosHitSoluciones() {
  const arrayContratos = await getHistoriaContratos();

  if (arrayContratos.length === 0)
    throw Error("No hay contratos para traspasar");

  const batchSize = 1000;
  let batchStart = 0;

  await recSoluciones("soluciones", "DELETE FROM historicoContratos");

  while (batchStart < arrayContratos.length) {
    // Extrae un lote de filas
    const batch = arrayContratos.slice(batchStart, batchStart + batchSize);

    // Construye una consulta de inserción para este lote
    let insertQuery =
      "INSERT INTO historicoContratos (horasContrato, dni, inicioContrato, finalContrato, fechaAlta, fechaAntiguedad, fechaBaja) VALUES ";

    const rows = batch.map((row) => {
      return `('${row.horasContrato}', '${row.dni}', ${convertToDate(
        row.inicioContrato,
      )}, ${convertToDate(row.finalContrato)}, ${convertToDate(
        row.fechaAlta,
      )}, ${convertToDate(row.fechaAntiguedad)}, ${convertToDate(
        row.fechaBaja,
      )})`;
    });

    insertQuery += rows.join(", ");

    try {
      await recSolucionesClassic("soluciones", insertQuery);
    } catch (error) {
      console.log(`Failed to insert rows: ${error}`);
    }

    // Avanza al siguiente lote
    batchStart += batchSize;
  }

  return true;
}
export async function getHistoricoContratos(dni: string) {
  const sql = `select * from historicoContratos where dni = @param0`;

  const resUser = await recSoluciones("soluciones", sql, dni);

  if (resUser.recordset.length > 0) return resUser.recordset;
  return null;
}

export async function uploadFoto(displayFoto: string, uid: string) {
  const sql = `update trabajadores set displayFoto=@param0 where idApp=@param1`;
  const resUser = await recSoluciones("soluciones", sql, displayFoto, uid);
  if (resUser.recordset) return resUser.recordset;
  return null;
}
