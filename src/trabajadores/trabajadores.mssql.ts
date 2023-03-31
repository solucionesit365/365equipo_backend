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
        FORMAT(tr.fechaNacimiento, 'dd/MM/yyyy') as fechaNacimiento,
        tr.nacionalidad,
        tr.nSeguridadSocial,
        tr.codigoPostal,
        tr.cuentaCorriente,
        tr.tipoTrabajador,
        FORMAT(tr.inicioContrato, 'dd/MM/yyyy') as inicioContrato,
        FORMAT(tr.finalContrato, 'dd/MM/yyyy') as finalContrato,
        tr.idResponsable,
        tr.idTienda,
        (SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
        tr1.nombreApellidos as nombreResponsable,
        ti.nombre as nombreTienda,
        FORMAT(tr.antiguedad, 'dd/MM/yyyy') as antiguedad
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
    FORMAT(tr.fechaNacimiento, 'dd/MM/yyyy') as fechaNacimiento,
    tr.nacionalidad,
    tr.nSeguridadSocial,
    tr.codigoPostal,
    tr.cuentaCorriente,
    tr.tipoTrabajador,
    FORMAT(tr.inicioContrato, 'dd/MM/yyyy') as inicioContrato,
    FORMAT(tr.finalContrato, 'dd/MM/yyyy') as finalContrato,
    tr.idResponsable,
    tr.idTienda,
    (SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
    tr1.nombreApellidos as nombreResponsable,
    ti.nombre as nombreTienda,
    FORMAT(tr.antiguedad, 'dd/MM/yyyy') as antiguedad
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
    FORMAT(tr.fechaNacimiento, 'dd/MM/yyyy') as fechaNacimiento,
    tr.nacionalidad,
    tr.nSeguridadSocial,
    tr.codigoPostal,
    tr.cuentaCorriente,
    tr.tipoTrabajador,
    FORMAT(tr.inicioContrato, 'dd/MM/yyyy') as inicioContrato,
    FORMAT(tr.finalContrato, 'dd/MM/yyyy') as finalContrato,
    tr.idResponsable,
    tr.idTienda,
    (SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
    tr1.nombreApellidos as nombreResponsable,
    ti.nombre as nombreTienda,
    FORMAT(tr.antiguedad, 'dd/MM/yyyy') as antiguedad
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
    (select idApp from trabajadores where id = tr.idResponsable) as validador
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
  }[]
> {
  const sqlQuery = ` 
  SELECT 
    de.codi as id,
    de.nom as nombreApellidos,
    de.memo as displayName,
    ex0.valor as emails,
    ex1.valor as dni,
    ex2.valor as direccion,
    ex3.valor as ciudad,
    ex4.valor as telefonos,
    ex5.valor as fechaNacimiento,
    ex6.valor as nacionalidad,
    ex7.valor as nSeguridadSocial,
    ex8.valor as codigoPostal,
    ex9.valor as cuentaCorriente,
    ex10.valor as tipoTrabajador,
    (SELECT top 1 CONVERT(nvarchar, FechaAlta, 103) FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as inicioContrato,
    (SELECT top 1 CONVERT(nvarchar, FechaBaja, 103) FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as finalContrato,
    (SELECT top 1 CONVERT(nvarchar, FechaAntiguedad, 103) FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as antiguedad
  FROM Dependentes de
  LEFT JOIN dependentesExtes ex0 ON ex0.id = de.codi AND ex0.nom = 'EMAIL'
  LEFT JOIN dependentesExtes ex1 ON ex1.id = de.codi AND ex1.nom = 'DNI'
  LEFT JOIN dependentesExtes ex2 ON ex2.id = de.codi AND ex2.nom = 'ADRESA'
  LEFT JOIN dependentesExtes ex3 ON ex3.id = de.codi AND ex3.nom = 'CIUTAT'
  LEFT JOIN dependentesExtes ex4 ON ex4.id = de.codi AND ex4.nom = 'TLF_MOBIL'
  LEFT JOIN dependentesExtes ex5 ON ex5.id = de.codi AND ex5.nom = 'DATA_NAIXEMENT'
  LEFT JOIN dependentesExtes ex6 ON ex6.id = de.codi AND ex6.nom = 'NACIONALITAT'
  LEFT JOIN dependentesExtes ex7 ON ex7.id = de.codi AND ex7.nom = 'numSS'
  LEFT JOIN dependentesExtes ex8 ON ex8.id = de.codi AND ex8.nom = 'CODIGO POSTAL'
  LEFT JOIN dependentesExtes ex9 ON ex9.id = de.codi AND ex9.nom = 'CC'
  LEFT JOIN dependentesExtes ex10 ON ex10.id = de.codi AND ex10.nom = 'TIPUSTREBALLADOR'
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
      const isValid =
        isValidDate(usuario.fechaNacimiento) &&
        isValidDate(usuario.inicioContrato) &&
        isValidDate(usuario.antiguedad) &&
        usuario.dni &&
        usuario.dni != "" &&
        usuario.telefonos &&
        usuario.telefonos != "" &&
        !usuario.finalContrato;

      if (!isValid) {
        usuariosNoActualizadosNuevos.push(usuario);
      }
      return isValid;
    });

    // UPDATE
    const modificarEnAppValidos = modificarEnApp.filter((usuario) => {
      const isValid =
        isValidDate(usuario.fechaNacimiento) &&
        isValidDate(usuario.inicioContrato) &&
        isValidDate(usuario.antiguedad);

      if (!isValid) {
        usuariosNoActualizadosApp.push(usuario);
      }
      return isValid;
    });

    const batchSize = 100; // Ajusta este valor según las necesidades de rendimiento

    for (let i = 0; i < usuariosNuevosValidos.length; i += batchSize) {
      const batch = usuariosNuevosValidos.slice(i, i + batchSize);
      const query = batch
        .map((usuario) => {
          return `
  INSERT INTO dbo.trabajadores (
    id, idApp, nombreApellidos, displayName, emails, dni, direccion, ciudad,
    telefonos, fechaNacimiento, nacionalidad, nSeguridadSocial, codigoPostal,
    cuentaCorriente, tipoTrabajador, inicioContrato, finalContrato, antiguedad
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
    ${convertOrNULL(usuario.antiguedad)}
  )`;
        })
        .join(";");

      await recSolucionesClassic(database, query);
    }

    for (let i = 0; i < modificarEnAppValidos.length; i += batchSize) {
      const batch = modificarEnAppValidos.slice(i, i + batchSize);
      const query = batch
        .map((usuario) => {
          return `
      UPDATE dbo.trabajadores
      SET
        dni = '${usuario.dni}',
        inicioContrato = ${convertOrNULL(usuario.inicioContrato)},
        finalContrato = ${convertOrNULL(usuario.finalContrato)},
        antiguedad = ${convertOrNULL(usuario.antiguedad)}
      WHERE id = ${usuario.id}`;
        })
        .join(";");

      await recSolucionesClassic(database, query);
    }

    return {
      usuariosNoActualizadosNuevos,
      usuariosNoActualizadosApp,
    };
  } catch (error) {
    console.error("Error al actualizar usuarios:", error);
  }
}
