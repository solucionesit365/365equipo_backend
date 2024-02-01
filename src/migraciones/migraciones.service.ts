import { Injectable } from "@nestjs/common";
import { Tienda } from "../tiendas/tiendas.class";
import { PrismaService } from "../prisma/prisma.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";

@Injectable()
export class MigracionesService {
  constructor(
    private readonly tiendasService: Tienda,
    private readonly trabajadoresService: TrabajadorService,
    private readonly prisma: PrismaService,
  ) {}

  async tiendasSqlServerToMysql() {
    const tiendas = await this.tiendasService.getTiendas();

    await this.prisma.tienda.createMany({
      data: tiendas,
    });
  }

  async trabajadoresSqlServerToMysql() {
    const trabajadores = await this.trabajadoresService.getTrabajadores();

    await this.prisma.trabajador.createMany({
      data: trabajadores.map((trabajador) => ({
        id: trabajador.id,
        idApp: trabajador.idApp,
        nombreApellidos: trabajador.nombreApellidos,
        displayName: trabajador.displayName,
        emails: trabajador.emails,
        dni: trabajador.dni,
        direccion: trabajador.direccion,
        ciudad: trabajador.ciudad,
        telefonos: trabajador.telefonos,
        fechaNacimiento: trabajador.fechaNacimiento
          ? trabajador.fechaNacimiento
          : null,
        nacionalidad: trabajador.nacionalidad,
        nSeguridadSocial: trabajador.nSeguridadSocial,
        codigoPostal: trabajador.codigoPostal,
        cuentaCorriente: trabajador.cuentaCorriente,
        tipoTrabajador: trabajador.tipoTrabajador,
        idResponsable: trabajador.idResponsable,
        idTienda: trabajador.idTienda,
        llevaEquipo: trabajador.llevaEquipo,
        tokenQR: trabajador.tokenQR,
        displayFoto: trabajador.displayFoto,
      })),
    });
  }

  async contratosSqlServerToMysql() {
    // // Obtener los contratos desde SQL Server
    // const contratos = (
    //   await recSolucionesClassic(
    //     "soluciones",
    //     `select
    //       horasContrato,
    //       dni,
    //       CONVERT(varchar, inicioContrato, 103) as inicioContrato,
    //       CONVERT(varchar, finalContrato, 103) as finalContrato,
    //       CONVERT(varchar, fechaAlta, 103) as fechaAlta,
    //       CONVERT(varchar, fechaAntiguedad, 103) as fechaAntiguedad,
    //       CONVERT(varchar, fechaBaja, 103) as fechaBaja
    //     from historicoContratos where inicioContrato is not null`,
    //   )
    // ).recordsets[0];
    // // Obtener los DNI de los trabajadores existentes
    // const trabajadores = await this.prisma.trabajador.findMany({
    //   select: { dni: true },
    // });
    // const dniValidos = new Set(trabajadores.map((t) => t.dni));
    // // Filtrar contratos con DNI válidos
    // const contratosValidos = contratos.filter((contrato) =>
    //   dniValidos.has(contrato.dni),
    // );
    // // Crear contratos en Prisma
    // await this.prisma.contrato.createMany({
    //   data: contratosValidos.map((contrato) => ({
    //     horasContrato: contrato.horasContrato,
    //     inicioContrato: contrato.inicioContrato
    //       ? DateTime.fromFormat(
    //           contrato.inicioContrato,
    //           "dd/MM/yyyy",
    //         ).toJSDate()
    //       : null,
    //     finalContrato: contrato.finalContrato
    //       ? DateTime.fromFormat(contrato.finalContrato, "dd/MM/yyyy").toJSDate()
    //       : null,
    //     fechaAlta: contrato.fechaAlta
    //       ? DateTime.fromFormat(contrato.fechaAlta, "dd/MM/yyyy").toJSDate()
    //       : null,
    //     fechaAntiguedad: contrato.fechaAntiguedad
    //       ? DateTime.fromFormat(
    //           contrato.fechaAntiguedad,
    //           "dd/MM/yyyy",
    //         ).toJSDate()
    //       : null,
    //     fechaBaja: contrato.fechaBaja
    //       ? DateTime.fromFormat(contrato.fechaBaja, "dd/MM/yyyy").toJSDate()
    //       : null,
    //     dni: contrato.dni,
    //   })),
    // });
    // return contratosValidos;
  }
}
