import { recHit, recSoluciones, recSolucionesClassic } from "../bbdd/mssql";
import { TrabajadorSql } from "./trabajadores.interface";
import * as moment from "moment";

/* Todos */
export async function getTrabajadores(todos = false) {
  const sql = `
    SELECT 
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
        tr1.nombreApellidos as nombreResponsable,
        ti.nombre as nombreTienda,
        CONVERT(nvarchar, tr.antiguedad, 103) as antiguedad,
        tr.idEmpresa,
        tr.tokenQR
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

export async function getTrabajadorTokenQR(idTrabajador: number, tokenQR: string){
  const sql = `
  SELECT 
  tr.nombreApellidos,
  tr.tipoTrabajador
  FROM trabajadores tr
  WHERE tr.id = @param0 AND tr.tokenQR = @param1
  `
  const resTrabajador = await recSoluciones("soluciones", sql, idTrabajador, tokenQR);
  if (resTrabajador.recordset.length > 0) 
    return resTrabajador.recordset[0] as TrabajadorSql;
  return null;
}

/* Individual x uid */
export async function getTrabajadorByAppId(uid: string) {
  const sql = `

  SELECT 
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
    tr1.nombreApellidos as nombreResponsable,
    ti.nombre as nombreTienda,
    CONVERT(nvarchar, tr.antiguedad, 103) as antiguedad,
    tr.idEmpresa
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
    tr1.nombreApellidos as nombreResponsable,
    ti.nombre as nombreTienda,
    CONVERT(nvarchar, tr.antiguedad, 103) as antiguedad,
    tr.idEmpresa
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

  if (resCoordi.recordset.length > 0) return true;
  return false;
}

export async function getSubordinados(uid: string): Promise<
  {
    id: number;
    idApp: string;
    nombreApellidos: string;
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

/* ¡¡ A HIT !! */
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

function convertOrNULL(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  return `CONVERT(datetime, '${value}', 103)`;
}

function isValidDate(value) {
  return moment(value, "DD/MM/YYYY").isValid();
}

// export async function actualizarUsuarios(
//   database: string,
//   usuariosNuevos,
//   modificarEnApp,
// ) {
//   try {
//     const usuariosNoActualizadosNuevos = [];
//     const usuariosNoActualizadosApp = [];

//     // INSERT
//     const usuariosNuevosValidos = usuariosNuevos.filter((usuario) => {
//       const isValid =
//         isValidDate(usuario.fechaNacimiento) &&
//         isValidDate(usuario.inicioContrato) &&
//         isValidDate(usuario.antiguedad) &&
//         usuario.dni &&
//         usuario.dni != "" &&
//         usuario.telefonos &&
//         usuario.telefonos != "" &&
//         !usuario.finalContrato;

//       if (!isValid) {
//         usuariosNoActualizadosNuevos.push(usuario);
//       }
//       return isValid;
//     });

//     // UPDATE
//     const modificarEnAppValidos = modificarEnApp.filter((usuario) => {
//       const isValid =
//         isValidDate(usuario.fechaNacimiento) &&
//         isValidDate(usuario.inicioContrato) &&
//         isValidDate(usuario.antiguedad);

//       if (!isValid) {
//         usuariosNoActualizadosApp.push(usuario);
//       }
//       return isValid;
//     });

//     const batchSize = 100; // Ajusta este valor según las necesidades de rendimiento

//     for (let i = 0; i < usuariosNuevosValidos.length; i += batchSize) {
//       const batch = usuariosNuevosValidos.slice(i, i + batchSize);
//       const query = batch
//         .map((usuario) => {
//           return `
//   INSERT INTO dbo.trabajadores (
//     id, idApp, nombreApellidos, displayName, emails, dni, direccion, ciudad,
//     telefonos, fechaNacimiento, nacionalidad, nSeguridadSocial, codigoPostal,
//     cuentaCorriente, tipoTrabajador, inicioContrato, finalContrato, antiguedad, idEmpresa
//   ) VALUES (
//     ${usuario.id},
//     '${usuario.idApp}',
//     '${usuario.nombreApellidos}',
//     '${usuario.displayName}',
//     '${usuario.emails}',
//     '${usuario.dni}',
//     '${usuario.direccion}',
//     '${usuario.ciudad}',
//     '${usuario.telefonos}',
//     ${convertOrNULL(usuario.fechaNacimiento)},
//     '${usuario.nacionalidad}',
//     '${usuario.nSeguridadSocial}',
//     '${usuario.codigoPostal}',
//     '${usuario.cuentaCorriente}',
//     '${usuario.tipoTrabajador}',
//     ${convertOrNULL(usuario.inicioContrato)},
//     ${convertOrNULL(usuario.finalContrato)},
//     ${convertOrNULL(usuario.antiguedad)},
//     ${usuario.idEmpresa}
//   )`;
//         })
//         .join(";");

//       await recSolucionesClassic(database, query);
//     }

//     for (let i = 0; i < modificarEnAppValidos.length; i += batchSize) {
//       const batch = modificarEnAppValidos.slice(i, i + batchSize);
//       const query = batch
//         .map((usuario) => {
//           return `
//       UPDATE dbo.trabajadores
//       SET
//         dni = '${usuario.dni}',
//         inicioContrato = ${convertOrNULL(usuario.inicioContrato)},
//         finalContrato = ${convertOrNULL(usuario.finalContrato)},
//         antiguedad = ${convertOrNULL(usuario.antiguedad)},
//         idEmpresa = ${usuario.idEmpresa}
//       WHERE id = ${usuario.id}`;
//         })
//         .join(";");

//       await recSolucionesClassic(database, query);
//     }

//     return {
//       usuariosNoActualizadosNuevos,
//       usuariosNoActualizadosApp,
//     };
//   } catch (error) {
//     console.error("Error al actualizar usuarios:", error);
//   }
// }

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
        '${usuario.idApp}',
        '${usuario.nombreApellidos}',
        '${usuario.displayName}',
        '${usuario.emails}',
        '${usuario.dni}',
        '${usuario.direccion}',
        '${usuario.ciudad}',
        '${usuario.telefonos}',
        ${convertOrNULL(usuario.fechaNacimiento)},
        '${usuario.nacionalidad}',
        '${usuario.nSeguridadSocial}',
        '${usuario.codigoPostal}',
        '${usuario.cuentaCorriente}',
        '${usuario.tipoTrabajador}',
        ${convertOrNULL(usuario.inicioContrato)},
        ${convertOrNULL(usuario.finalContrato)},
        ${convertOrNULL(usuario.antiguedad)},
        ${usuario.idEmpresa}
      )`;

    const updateQueryBuilder = (usuario) => `
      UPDATE dbo.trabajadores
      SET
        dni = '${usuario.dni}',
        inicioContrato = ${convertOrNULL(usuario.inicioContrato)},
        finalContrato = ${convertOrNULL(usuario.finalContrato)},
        antiguedad = ${convertOrNULL(usuario.antiguedad)},
        idEmpresa = ${usuario.idEmpresa}
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
    if (arrayUsuarios[i].id)
      sql += `DELETE FROM trabajadores WHERE id = ${arrayUsuarios[i].id};`;
  }

  await recSolucionesClassic("soluciones", sql);
}
