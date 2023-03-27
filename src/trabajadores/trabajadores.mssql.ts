import { recSoluciones } from "../bbdd/mssql";
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
