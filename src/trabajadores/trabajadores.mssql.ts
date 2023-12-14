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
tr1.idApp as idAppResponsable, 
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
  const resUser = await recSolucionesNew(sql, uid);

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

  if (resCoordi.recordset.length > 0 && resCoordi.recordset[0].llevaEquipo > 0)
    return true;
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

  if (resCoordi.recordset.length > 0 && resCoordi.recordset[0].llevaEquipo > 0)
    return true;
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
    fechaNacimiento: string;
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
      fechaNacimiento,
      CONVERT(varchar, antiguedad, 103) as antiguedad, 
      CONVERT(varchar, inicioContrato, 103) as inicioContrato 
    from trabajadores 
    where idResponsable = (select id from trabajadores where idApp = @param0)
  `;
  const resSubordinados = await recSolucionesNew(sql, uid);
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

async function executeBatch(batch, queryBuilder) {
  const query = batch.map(queryBuilder).join(";");
  await recSolucionesClassic("eliminarEsto", query);
}

export async function actualizarUsuarios(usuariosNuevos, modificarEnApp) {
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
      promises.push(executeBatch(batch, insertQueryBuilder));
    }

    for (let i = 0; i < modificarEnAppValidos.length; i += batchSize) {
      const batch = modificarEnAppValidos.slice(i, i + batchSize);
      promises.push(executeBatch(batch, updateQueryBuilder));
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

export async function deleteHistoricoContratos() {
  await recSoluciones("soluciones", "DELETE FROM historicoContratos");
}

export async function insertQuery(query: string) {
  await recSoluciones("soluciones", query);
}
