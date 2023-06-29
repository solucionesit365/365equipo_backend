import { recSoluciones, recSolucionesClassic } from "../bbdd/mssql";
import { SolicitudVacaciones } from "./vacaciones.interface";

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
// Substituir por la constante
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
//   const resUsuarios = await recSoluciones(sql);

//   if (resUsuarios.recordset.length > 0)
//     return resUsuarios.recordset as TrabajadorDto[];
//   return null;
// }

/* Individual x uid */
export async function getSolicitudesTrabajadorUid(uid: string): Promise<
  {
    idSolicitud: number;
    idBeneficiario: number;
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
    idBeneficiario,
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
  const resUser = await recSoluciones(sql, uid, new Date().getFullYear());

  if (resUser.recordset.length > 0) return resUser.recordset;
  return [];
}

/* Individual x sqlId. la cosulta debe ser igual a getSolicitudesTrabajadorUid con el cambio obvio*/
export async function getSolicitudesTrabajadorSqlId(id: number): Promise<
  {
    idSolicitud: number;
    idBeneficiario: number;
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
    idBeneficiario,
    dias, 
    CONVERT(nvarchar, fechaInicio, 103) as fechaInicio, 
    CONVERT(nvarchar, fechaFinal, 103) as fechaFinal, 
    CONVERT(nvarchar, fechaIncorporacion, 103) as fechaIncorporacion,
    observaciones,
    respuestaSolicitud,
    CONVERT(nvarchar, fechaCreacion, 103) as fechaCreacion,
    estado
  FROM solicitudVacaciones where idBeneficiario = @param0 AND year(fechaInicio) = @param1
`;
  const resUser = await recSoluciones(sql, id, new Date().getFullYear());

  if (resUser.recordset.length > 0) return resUser.recordset;
  return [];
}

export async function getSolicitudById(idSolicitud: number) {
  const sql = "SELECT * FROM solicitudVacaciones WHERE idSolicitud = @param0;";

  const resSoli = await recSoluciones(sql, idSolicitud);

  return resSoli.recordset[0];
}

export async function borrarSolicitud(idSolicitud: number): Promise<boolean> {
  const sql = `
    DELETE FROM solicitudVacaciones WHERE idSolicitud = @param0;
`;
  await recSoluciones(sql, idSolicitud);

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
  const resSolicitudes = await recSoluciones(sql);

  if (resSolicitudes.recordset.length > 0) return resSolicitudes.recordset;
  return [];
}
export async function getSolicitudesParaEnviar(): Promise<
  {
    idBeneficiario: number;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    observaciones: string;
    respuestaSolicitud: string;
    fechaCreacion: string;
    estado: string;
    idSolicitud: number;
    enviado: boolean;
  }[]
> {
  const sql = `
  SELECT 
    so.idBeneficiario,
    so.dias, 
    CONVERT(nvarchar, so.fechaInicio, 103) as fechaInicio,
    CONVERT(nvarchar, so.fechaFinal, 103) as fechaFinal,
    CONVERT(nvarchar, so.fechaIncorporacion, 103) as fechaIncorporacion,
    so.observaciones,
    so.respuestaSolicitud,
    CONVERT(nvarchar, so.fechaCreacion, 103) as fechaCreacion,
    so.estado,
    so.idSolicitud,
    so.enviado
  FROM solicitudVacaciones so WHERE so.estado = 'APROBADA' AND (so.enviado <> 1 OR so.enviado IS NULL) ORDER BY idSolicitud;
`;
  const resSolicitudes = await recSoluciones(sql);

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
  const resSolicitudes = await recSoluciones(sql, idApp);

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
    retSetEstado = await recSoluciones(sql, estado, respuesta, idSolicitud);
  } else {
    const sql =
      "UPDATE solicitudVacaciones SET estado = @param0 WHERE idSolicitud = @param1;";
    retSetEstado = await recSoluciones(sql, estado, idSolicitud);
  }

  if (retSetEstado.rowsAffected[0] > 0) return true;
  return false;
}

export async function nuevaSolicitudVacaciones(solicitud: SolicitudVacaciones) {
  const sql = `
  INSERT INTO solicitudVacaciones (
    idBeneficiario, 
    dias, 
    fechaInicio, 
    fechaFinal, 
    fechaIncorporacion, 
    observaciones,
    estado
    )
  VALUES (
    ${solicitud.idBeneficiario}, 
    ${solicitud.totalDias},
    CONVERT(datetime, '${solicitud.fechaInicial}', 103), 
    CONVERT(datetime, '${solicitud.fechaFinal}', 103), 
    CONVERT(datetime, '${solicitud.fechaIncorporacion}', 103), 
    '${solicitud.observaciones}', 
    'PENDIENTE'
    );
  `;

  await recSolucionesClassic(sql);

  return true;
}

export async function getVacacionesByTiendas(idTienda: number) {
  const sql = `  SELECT 
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
 trabajadores.idTienda
FROM solicitudVacaciones so INNER JOIN trabajadores ON so.idBeneficiario = trabajadores.id where trabajadores.idTienda =@param0`;

  const resVacacionesByTienda = await recSoluciones(sql, idTienda);
  if (resVacacionesByTienda.recordset.length > 0)
    return resVacacionesByTienda.recordset;
  return [];
}
export async function getVacacionesByEstado(estado: string) {
  const sql = `  SELECT 
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
  (select nombreApellidos from trabajadores where id = (select idResponsable from trabajadores where id = so.idBeneficiario)) as nombreResponsable
FROM solicitudVacaciones so INNER JOIN trabajadores ON so.idBeneficiario = trabajadores.id where so.estado =@param0`;

  const resVacacionesByEstado = await recSoluciones(sql, estado);
  if (resVacacionesByEstado.recordset.length > 0)
    return resVacacionesByEstado.recordset;
  return [];
}
