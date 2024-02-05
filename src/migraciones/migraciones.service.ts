// import { Injectable } from "@nestjs/common";
// import { Tienda } from "../tiendas/tiendas.class";
// import { PrismaService } from "../prisma/prisma.service";
// import { TrabajadorService } from "../trabajadores/trabajadores.class";
// import { DateTime } from "luxon";
// import * as sql from "mssql";

// const GET_DATOS_TRABAJADOR = `
// tr.id,
// tr.idApp,
// tr.nombreApellidos,
// tr.displayName,
// tr.emails,
// tr.dni,
// tr.direccion,
// tr.ciudad,
// tr.telefonos,
// CONVERT(nvarchar, tr.fechaNacimiento, 103) as fechaNacimiento,
// tr.nacionalidad,
// tr.nSeguridadSocial,
// tr.codigoPostal,
// tr.cuentaCorriente,
// tr.tipoTrabajador,
// CONVERT(nvarchar, tr.inicioContrato, 103) as inicioContrato,
// CONVERT(nvarchar, tr.finalContrato, 103) as finalContrato,
// tr.idResponsable,
// tr.idTienda,
// (SELECT COUNT(*) FROM trabajadores WHERE idResponsable = tr.id) as coordinadora,
// (SELECT top 1 horasContrato*40/100 FROM historicoContratos WHERE dni = tr.dni
// AND inicioContrato <= GETDATE() AND (fechaBaja >= GETDATE() OR fechaBaja IS NULL)
// ) as horasContrato,
// tr1.nombreApellidos as nombreResponsable,
// tr1.idApp as idAppResponsable, 
// ti.nombre as nombreTienda,
// CONVERT(nvarchar, tr.antiguedad, 103) as antiguedad,
// tr.idEmpresa,
// tr.tokenQR,
// tr.displayFoto
// `;

// @Injectable()
// export class MigracionesService {
//   constructor(
//     private readonly tiendasService: Tienda,
//     private readonly trabajadoresService: TrabajadorService,
//     private readonly prisma: PrismaService,
//   ) {}

//   async recSolucionesClassic(database: string, consultaSQL: string) {
//     const config = {
//       user: process.env.MSSQL_USER_SOLUCIONES,
//       password: process.env.MSSQL_PASS_SOLUCIONES,
//       server: process.env.MSSQL_HOST_SOLUCIONES,
//       database: database,
//       connectionTimeout: 50000,
//       options: {
//         encrypt: false,
//         trustServerCertificate: true,
//       },
//       pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 20000,
//       },
//       requestTimeout: 20000,
//     };

//     // console.log(consultaSQL);
//     const pool = await new sql.ConnectionPool(config).connect();
//     const result = await pool.request().query(consultaSQL);
//     pool.close();
//     return result;
//   }

//   async getTiendas(): Promise<
//     {
//       id: number;
//       nombre: string;
//       direccion: string;
//       idExterno: number;
//     }[]
//   > {
//     const sql =
//       "SELECT id, (nombre) as nombre, direccion, idExterno FROM tiendas ORDER BY nombre";
//     const resTiendas = await this.recSolucionesClassic("soluciones", sql);

//     if (resTiendas.recordset.length > 0) return resTiendas.recordset;
//     return null;
//   }

//   async tiendasSqlServerToMysql() {
//     const tiendas = await this.getTiendas();

//     await this.prisma.tienda.createMany({
//       data: tiendas,
//     });

//     return tiendas.length;
//   }

//   async getTrabajadores() {
//     const sql = `
//       SELECT 
//           ${GET_DATOS_TRABAJADOR}
//       FROM trabajadores tr
//       LEFT JOIN trabajadores tr1 ON tr.idResponsable = tr1.id
//       LEFT JOIN tiendas ti ON tr.idTienda = ti.id
//       ORDER BY nombreApellidos
//       `;
//     const resUsuarios = await this.recSolucionesClassic("soluciones", sql);

//     if (resUsuarios.recordset.length > 0) return resUsuarios.recordset as any[];
//     return null;
//   }

//   async trabajadoresSqlServerToMysql() {
//     const trabajadores = await this.getTrabajadores();

//     await this.prisma.trabajador.createMany({
//       data: trabajadores.map((trabajador) => ({
//         id: trabajador.id,
//         idApp: trabajador.idApp,
//         nombreApellidos: trabajador.nombreApellidos,
//         displayName: trabajador.displayName,
//         emails: trabajador.emails,
//         dni: trabajador.dni,
//         direccion: trabajador.direccion,
//         ciudad: trabajador.ciudad,
//         telefonos: trabajador.telefonos,
//         fechaNacimiento: trabajador.fechaNacimiento
//           ? DateTime.fromFormat(
//               trabajador.fechaNacimiento,
//               "dd/MM/yyyy",
//             ).toJSDate()
//           : null,
//         nacionalidad: trabajador.nacionalidad,
//         nSeguridadSocial: trabajador.nSeguridadSocial,
//         codigoPostal: trabajador.codigoPostal,
//         cuentaCorriente: trabajador.cuentaCorriente,
//         tipoTrabajador: trabajador.tipoTrabajador,
//         idResponsable: null, //trabajador.idResponsable,
//         idTienda: trabajador.idTienda,
//         llevaEquipo: trabajador.coordinadora ? true : false,
//         tokenQR: trabajador.tokenQR,
//         displayFoto: trabajador.displayFoto,
//       })),
//     });

//     return trabajadores.length;
//   }

//   async updateResponsables() {
//     const trabajadores = await this.getTrabajadores();
//     const responsables = trabajadores;

//     for (const responsable of responsables) {
//       if (!responsable.idResponsable) continue;
//       await this.prisma.trabajador.update({
//         where: { id: responsable.id },

//         data: {
//           responsable: {
//             connect: { id: responsable.idResponsable },
//           },
//         },
//       });
//     }
//   }

//   async contratosSqlServerToMysql() {
//     // Obtener los contratos desde SQL Server
//     const contratos = (
//       await this.recSolucionesClassic(
//         "soluciones",
//         `select
//           horasContrato,
//           dni,
//           CONVERT(varchar, inicioContrato, 103) as inicioContrato,
//           CONVERT(varchar, finalContrato, 103) as finalContrato,
//           CONVERT(varchar, fechaAlta, 103) as fechaAlta,
//           CONVERT(varchar, fechaAntiguedad, 103) as fechaAntiguedad,
//           CONVERT(varchar, fechaBaja, 103) as fechaBaja
//         from historicoContratos where inicioContrato is not null`,
//       )
//     ).recordsets[0];
//     // Obtener los DNI de los trabajadores existentes
//     const trabajadores = await this.prisma.trabajador.findMany({
//       select: { dni: true },
//     });
//     const dniValidos = new Set(trabajadores.map((t) => t.dni));
//     // Filtrar contratos con DNI válidos
//     const contratosValidos = contratos.filter((contrato) =>
//       dniValidos.has(contrato.dni),
//     );
//     // Crear contratos en Prisma
//     await this.prisma.contrato.createMany({
//       data: contratosValidos.map((contrato) => ({
//         horasContrato: contrato.horasContrato,
//         inicioContrato: contrato.inicioContrato
//           ? DateTime.fromFormat(
//               contrato.inicioContrato,
//               "dd/MM/yyyy",
//             ).toJSDate()
//           : null,
//         finalContrato: contrato.finalContrato
//           ? DateTime.fromFormat(contrato.finalContrato, "dd/MM/yyyy").toJSDate()
//           : null,
//         fechaAlta: contrato.fechaAlta
//           ? DateTime.fromFormat(contrato.fechaAlta, "dd/MM/yyyy").toJSDate()
//           : null,
//         fechaAntiguedad: contrato.fechaAntiguedad
//           ? DateTime.fromFormat(
//               contrato.fechaAntiguedad,
//               "dd/MM/yyyy",
//             ).toJSDate()
//           : null,
//         fechaBaja: contrato.fechaBaja
//           ? DateTime.fromFormat(contrato.fechaBaja, "dd/MM/yyyy").toJSDate()
//           : null,
//         dni: contrato.dni,
//       })),
//     });
//     return contratosValidos;
//   }
// }
