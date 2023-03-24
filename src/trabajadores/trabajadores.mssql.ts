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
        ti.nombre as nombreTienda
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
    ti.nombre as nombreTienda
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
