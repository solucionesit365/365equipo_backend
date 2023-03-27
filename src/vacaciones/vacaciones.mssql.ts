import { recSoluciones } from "../bbdd/mssql";

/* Todos */
// export async function getTrabajadores() {
//   const sql = `
//     SELECT
//         tr.id,
//         tr.idApp,
//         tr.nombreApellidos,
//         tr.displayName,
//         tr.emails,
//         tr.dni,
//         tr.direccion,
//         tr.ciudad,
//         tr.telefonos,
//         FORMAT(tr.fechaNacimiento, 'dd/MM/yyyy') as fechaNacimiento,
//         tr.nacionalidad,
//         tr.nSeguridadSocial,
//         tr.codigoPostal,
//         tr.cuentaCorriente,
//         tr.tipoTrabajador,
//         FORMAT(tr.inicioContrato, 'dd/MM/yyyy') as inicioContrato,
//         FORMAT(tr.finalContrato, 'dd/MM/yyyy') as finalContrato,
//         tr.idResponsable,
//         tr.idTienda,
//         (SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
//         tr1.nombreApellidos as nombreResponsable,
//         ti.nombre as nombreTienda,
//         FORMAT(tr.antiguedad, 'dd/MM/yyyy') as antiguedad
//     FROM trabajadores tr
//     LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
//     LEFT JOIN tiendas ti ON tr.idTienda = ti.id
//     WHERE tr.inicioContrato IS NOT NULL AND tr.finalContrato IS NULL ORDER BY nombreApellidos
//     `;
//   const resUsuarios = await recSoluciones("soluciones", sql);

//   if (resUsuarios.recordset.length > 0)
//     return resUsuarios.recordset as TrabajadorDto[];
//   return null;
// }

/* Individual x uid */
export async function getSolicitudesTrabajador(uid: string): Promise<
  {
    idSolicitud: number;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    observaciones: string;
    respuestaSolicitud: string;
    fechaCreacion: string;
    estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  }[]
> {
  const sql = `
  SELECT
    idSolicitud,
    dias, 
    CONVERT(nvarchar, fechaInicio, 103) as fechaInicio, 
    CONVERT(nvarchar, fechaFinal, 103) as fechaFinal, 
    CONVERT(nvarchar, fechaIncorporacion, 103) as fechaIncorporacion,
    observaciones,
    respuestaSolicitud,
    CONVERT(nvarchar, fechaCreacion, 103) as fechaCreacion,
    estado
  FROM solicitudVacaciones where idBeneficiario = (select id from trabajadores where idApp = @param0) AND year(fechaInicio) = @param1
`;
  const resUser = await recSoluciones(
    "soluciones",
    sql,
    uid,
    new Date().getFullYear(),
  );

  if (resUser.recordset.length > 0) return resUser.recordset;
  return [];
}

export async function borrarSolicitud(idSolicitud: number): Promise<boolean> {
  console.log("el id es", idSolicitud);
  const sql = `
    DELETE FROM solicitudVacaciones WHERE idSolicitud = @param0;
`;
  await recSoluciones("soluciones", sql, idSolicitud);

  return true;
}

export async function getSolicitudes(): Promise<
  {
    idBeneficiario: number;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    fechaCreacion: string;
    estado: string;
    observaciones: string;
    idSolicitud: number;
    idResponsable: number;
    idTienda: number;
    nombreApellidos: string;
    nombreTienda: string;
    nombreResponsable: string;
    llevaEquipo: number;
  }[]
> {
  const sql = `
  SELECT 
    so.idBeneficiario,
    so.dias, 
    CONVERT(nvarchar, so.fechaInicio, 103) as fechaInicio,
    CONVERT(nvarchar, so.fechaFinal, 103) as fechaFinal,
    CONVERT(nvarchar, so.fechaIncorporacion, 103) as fechaIncorporacion,
    CONVERT(nvarchar, so.fechaCreacion, 103) as fechaCreacion,
    so.estado,
    so.observaciones,
    so.idSolicitud,
    (select idResponsable from trabajadores where id = so.idBeneficiario) as idResponsable,
    (select idTienda from trabajadores where id = so.idBeneficiario) as idTienda,
    (select nombreApellidos from trabajadores where id = so.idBeneficiario) as nombreApellidos,
    (select nombre from tiendas where id = (select idTienda from trabajadores where id = so.idBeneficiario)) as nombreTienda,
    (select nombreApellidos from trabajadores where id = (select idResponsable from trabajadores where id = so.idBeneficiario)) as nombreResponsable,
    (select count(*) from trabajadores where idResponsable = so.idBeneficiario) as llevaEquipo
  FROM solicitudVacaciones so
`;
  const resSolicitudes = await recSoluciones("soluciones", sql);

  if (resSolicitudes.recordset.length > 0) return resSolicitudes.recordset;
  return [];
}

export async function getSolicitudesSubordinados(idApp: string): Promise<
  {
    idBeneficiario: number;
    idApp: string;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    fechaCreacion: string;
    estado: string;
    observaciones: string;
    idSolicitud: number;
    idResponsable: number;
    idTienda: number;
    nombreApellidos: string;
    nombreTienda: string;
    nombreResponsable: string;
    llevaEquipo: number;
    validador: string;
  }[]
> {
  const sql = `
  SELECT 
    so.idBeneficiario,
    (select idApp from trabajadores where id = so.idBeneficiario) as idApp,
    so.dias,
    CONVERT(nvarchar, so.fechaInicio, 103) as fechaInicio,
    CONVERT(nvarchar, so.fechaFinal, 103) as fechaFinal,
    CONVERT(nvarchar, so.fechaIncorporacion, 103) as fechaIncorporacion,
    CONVERT(nvarchar, so.fechaCreacion, 103) as fechaCreacion,
    so.estado,
    so.observaciones,
    so.idSolicitud,
    (select idResponsable from trabajadores where id = so.idBeneficiario) as idResponsable,
    (select idTienda from trabajadores where id = so.idBeneficiario) as idTienda,
    (select nombreApellidos from trabajadores where id = so.idBeneficiario) as nombreApellidos,
    (select nombre from tiendas where id = (select idTienda from trabajadores where id = so.idBeneficiario)) as nombreTienda,
    (select nombreApellidos from trabajadores where id = (select idResponsable from trabajadores where id = so.idBeneficiario)) as nombreResponsable,
    (select count(*) from trabajadores where idResponsable = so.idBeneficiario) as llevaEquipo,
    (select idApp from trabajadores where id = (select idResponsable from trabajadores where id = so.idBeneficiario)) as validador
  FROM solicitudVacaciones so
  WHERE so.idBeneficiario IN (
    select id from trabajadores where idResponsable = (SELECT id FROM trabajadores WHERE idApp = @param0)
    )
    order by so.idBeneficiario, so.fechaInicio
`;
  const resSolicitudes = await recSoluciones("soluciones", sql, idApp);

  if (resSolicitudes.recordset.length > 0) return resSolicitudes.recordset;
  return [];
}

export async function setEstadoSolicitud(
  estado: string,
  idSolicitud: number,
  respuesta: string,
) {
  let retSetEstado = null;

  if (estado === "RECHAZADA") {
    const sql =
      "UPDATE solicitudVacaciones SET estado = @param0, respuestaSolicitud = @param1 WHERE idSolicitud = @param2;";
    retSetEstado = await recSoluciones(
      "soluciones",
      sql,
      estado,
      respuesta,
      idSolicitud,
    );
  } else {
    const sql =
      "UPDATE solicitudVacaciones SET estado = @param0 WHERE idSolicitud = @param1;";
    retSetEstado = await recSoluciones("soluciones", sql, estado, idSolicitud);
  }

  if (retSetEstado.rowsAffected[0] > 0) return true;
  return false;
}
