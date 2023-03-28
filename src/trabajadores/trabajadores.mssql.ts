import { recHit, recSoluciones } from "../bbdd/mssql";
import { TrabajadorDto } from "./trabajadores.dto";

/* Todos */
export async function getTrabajadores() {
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
    WHERE tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL ORDER BY nombreApellidos
    `;
  const resUsuarios = await recSoluciones("soluciones", sql);

  if (resUsuarios.recordset.length > 0)
    return resUsuarios.recordset as TrabajadorDto[];
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
    return resUser.recordset[0] as TrabajadorDto;
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
    return resUser.recordset[0] as TrabajadorDto;
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
export async function getTrabajadoresSage(): Promise<any[]> {
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
    (SELECT top 1 FORMAT(FechaAlta, 'MM/dd/yyyy') FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as inicioContrato,
    (SELECT top 1 FORMAT(FechaBaja, 'MM/dd/yyyy') FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as finalContrato,
    (SELECT top 1 FORMAT(FechaAntiguedad, 'MM/dd/yyyy') FROM silema_ts.sage.dbo.EmpleadoNomina where dni = ex1.valor COLLATE SQL_Latin1_General_CP1_CI_AS order by FechaAlta desc) as antiguedad
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
