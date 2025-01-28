import { Controller, Get, Post, UseGuards, Body } from "@nestjs/common";
import { simpleParser } from "mailparser";
import { Roles } from "../decorators/role.decorator";
import { RoleGuard } from "../guards/role.guard";
import { AuthGuard } from "../guards/auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { LoggerService } from "../logger/logger.service";

@Controller("test")
export class TestController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
  ) {}

  @Roles("ADMIN", "DEPENDIENTA")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("testRole")
  async testRole() {
    return "Role test";
  }

  @Post("email")
  async sendEmail(@Body() req: any) {
    try {
      // Extrae el RAW MIME del cuerpo de la solicitud
      const rawEmail = req.email; // Campo enviado por SendGrid

      // Parsea el correo
      const parsedEmail = await simpleParser(rawEmail);

      // Guarda los datos en el log
      this.loggerService.create({
        action: "Prueba 1",
        name: "Eze",
        extraData: {
          quehace: "Envia un email correctamente Eze 28/01/2025",
          emailData: {
            from: parsedEmail.from?.text,
            subject: parsedEmail.subject,
            text: parsedEmail.text,
            attachments: parsedEmail.attachments?.map((a) => a.filename),
          },
        },
      });

      return "Operativo";
    } catch (error) {
      console.error("Error procesando correo:", error);
      return "Error interno";
    }
  }

  @Get()
  test() {
    this.loggerService.create({
      action: "Prueba 1",
      name: "Eze",
      extraData: { edad: 30, club: "FCBARCELONA Y RCentral" },
    });
    return "Operativo";
  }

  // constructor(private readonly cuadrantesInstance: Cuadrantes) {}
  // @Get()
  // test() {
  //   this.emailInstance.enviarEmail(
  //     "ezequiel@solucionesit365.com",
  //     "Mensaje aquí",
  //     "Asunto super importante",
  //   );
  //   return true;
  // }
  // @Get("ip")
  // async getIp(): Promise<string> {
  //   try {
  //     const response = await axios.get("https://api.ipify.org?format=json");
  //     return response.data.ip;
  //   } catch (error) {
  //     console.error("Error fetching IP:", error);
  //     throw new Error("Failed to fetch IP address");
  //   }
  // }
  // @Get("rectificarFichajesValidados")
  // async rectificarFichajesValidados() {
  //   try {
  //     const fichajesValidados = await this.fichajesValidadosInstance.getTodos();
  //     const fichajesValidadosRectificados: FichajeValidadoDto[] = [];
  //     for (let i = 0; i < fichajesValidados.length; i += 1) {
  //       try {
  //         const trabajadorAux =
  //           await this.trabajadoresInstance.getTrabajadorBySqlId(
  //             fichajesValidados[i].idTrabajador,
  //           );
  //         const fechaFichajeValidado = DateTime.fromFormat(
  //           fichajesValidados[i].fecha,
  //           "yyyy-MM-dd",
  //         );
  //         // Para establecer la hora de entrada
  //         const [horaEntrada, minutoEntrada] = fichajesValidados[
  //           i
  //         ].fichajes.entrada
  //           .split(":")
  //           .map(Number);
  //         const fichajeEntrada = fechaFichajeValidado.set({
  //           hour: horaEntrada,
  //           minute: minutoEntrada,
  //         });
  //         // Para establecer la hora de salida
  //         const [horaSalida, minutoSalida] = fichajesValidados[
  //           i
  //         ].fichajes.salida
  //           .split(":")
  //           .map(Number);
  //         const fichajeSalida = fechaFichajeValidado.set({
  //           hour: horaSalida,
  //           minute: minutoSalida,
  //         });
  //         // Para establecer la hra del cuadrante de entrada
  //         const [horaEntradaCuadranteAux, minutoEntradaCuadranteAux] =
  //           fichajesValidados[i].cuadrante.entrada.split(":").map(Number);
  //         const horaEntradaCuadrante = fechaFichajeValidado.set({
  //           hour: horaEntradaCuadranteAux,
  //           minute: minutoEntradaCuadranteAux,
  //         });
  //         // Para establecer la hra del cuadrante de salida
  //         const [horaSalidaCuadranteAux, minutoSalidaCuadranteAux] =
  //           fichajesValidados[i].cuadrante.salida.split(":").map(Number);
  //         const horaSalidaCuadrante = fechaFichajeValidado.set({
  //           hour: horaSalidaCuadranteAux,
  //           minute: minutoSalidaCuadranteAux,
  //         });
  //         const fichajeValidado: FichajeValidadoDto = {
  //           enviado: false,
  //           aPagar: fichajesValidados[i].aPagar,
  //           comentario: {
  //             entrada: fichajesValidados[i].comentarios.entrada,
  //             salida: fichajesValidados[i].comentarios.entrada,
  //           },
  //           cuadrante: {
  //             final: horaSalidaCuadrante.toJSDate(),
  //             inicio: horaEntradaCuadrante.toJSDate(),
  //             idTrabajador: fichajesValidados[i].cuadrante.idTrabajador,
  //             nombre: fichajesValidados[i].cuadrante.nombre,
  //             totalHoras: fichajesValidados[i].cuadrante.totalHoras,
  //             idTienda: fichajesValidados[i].cuadrante.idTienda,
  //           },
  //           dni: trabajadorAux.dni,
  //           idTienda: trabajadorAux.idTienda,
  //           fichajeEntrada: fichajeEntrada.toJSDate(),
  //           fichajeSalida: fichajeSalida.toJSDate(),
  //           horasAprendiz: fichajesValidados[i].horasAprendiz,
  //           horasCoordinacion: fichajesValidados[i].horasCoordinacion,
  //           horasCuadrante: fichajesValidados[i].horasCuadrante,
  //           horasExtra: fichajesValidados[i].horasExtra,
  //           horasFichaje: fichajesValidados[i].horasFichaje,
  //           horasPagar: {
  //             comentario: fichajesValidados[i].horasPagar.comentario,
  //             estadoValidado: fichajesValidados[i].horasPagar.estadoValidado,
  //             respSuper: fichajesValidados[i].horasPagar.respSuper,
  //             total: fichajesValidados[i].horasPagar.total,
  //           },
  //           idFichajes: {
  //             entrada: fichajesValidados[i].idFichajes.entrada,
  //             salida: fichajesValidados[i].idFichajes.salida,
  //           },
  //           idResponsable: fichajesValidados[i].idResponsable,
  //           idTrabajador: fichajesValidados[i].idTrabajador,
  //           nombre: fichajesValidados[i].nombre,
  //           pagado: fichajesValidados[i].pagado,
  //         };
  //         fichajesValidadosRectificados.push(fichajeValidado);
  //       } catch (err) {
  //         continue;
  //       }
  //     }
  //     return (
  //       await this.fichajesValidadosInstance.insertFichajesValidadosRectificados(
  //         fichajesValidadosRectificados,
  //       )
  //     ).acknowledged;
  //   } catch (err) {
  //     console.log(err);
  //     return err.message;
  //   }
  // }
  // @Post("crearUsuarioPruebas")
  // async crearUsuarioPruebas() {
  //   const trabajador: Prisma.TrabajadorCreateInput = {
  //     tienda: {
  //       connect: {
  //         id: 261,
  //       },
  //     },
  //     idApp: "3GpJyMuUCBdjmMeCllK7mR4cjnf1",
  //     responsable: {
  //       connect: {
  //         id: 3608,
  //       },
  //     },
  //     contratos: {
  //       create: {
  //         fechaAlta: DateTime.fromFormat("01/01/2023", "dd/MM/yyyy").toJSDate(),
  //         fechaAntiguedad: DateTime.fromFormat(
  //           "01/01/2023",
  //           "dd/MM/yyyy",
  //         ).toJSDate(),
  //         horasContrato: 100,
  //         inicioContrato: DateTime.fromFormat(
  //           "01/01/2023",
  //           "dd/MM/yyyy",
  //         ).toJSDate(),
  //       },
  //     },
  //     dni: "465798163A",
  //     ciudad: "Buenos Aires",
  //     codigoPostal: "56465",
  //     direccion: "Villa Fiorito",
  //     cuentaCorriente: "ES123456464654654654654654",
  //     emails: "diegomaradona@gmail.com",
  //     llevaEquipo: false,
  //     telefonos: "123456789",
  //     nacionalidad: "Argentina",
  //     nombreApellidos: "Diego Armando Maradona",
  //     nSeguridadSocial: "123456789",
  //     tipoTrabajador: "Leyenda",
  //     fechaNacimiento: new Date("1960-10-30T00:00:00.000Z"),
  //     displayName: "Maradona",
  //   };
  //   try {
  //     return await this.trabajadoresInstance.crearUsuarioInterno(trabajador);
  //   } catch (err) {
  //     console.log(err);
  //     new InternalServerErrorException("Error al crear el usuario de pruebas");
  //   }
  // }
  // @Post("rectificarCuadrantes")
  // async rectificarCuadrantes() {
  //   const cuadrantes = await this.cuadrantesInstance.getAllCuadrantes();
  //   for (let i = 0; i < cuadrantes.length; i += 1) {
  //     try {
  //       cuadrantes[i].inicio = DateTime.fromJSDate(cuadrantes[i].inicio)
  //         .plus({ hour: 1 })
  //         .toJSDate();
  //       cuadrantes[i].final = DateTime.fromJSDate(cuadrantes[i].final)
  //         .plus({ hour: 1 })
  //         .toJSDate();
  //     } catch (err) {
  //       console.log(err);
  //       throw new InternalServerErrorException(err.message);
  //     }
  //   }
  //   await this.cuadrantesInstance.rectificarAllCuadrantes(cuadrantes);
  //   return "OK";
  // }
  // @Post("rectificarFichajes")
  // async reactificarFichajes() {
  //   const fichajes = await this.fichajesInstance.getAllFichajes();
  //   // Recorrer y añadir dos campos nuevos a la interfaz de fichajes, desde getTrabajadorBySqlId (this.trabajadoresInstance.getTrabajadorByAppId(fichajes.uid))
  //   const cache = [];
  //   for (let i = 0; i < fichajes.length; i += 1) {
  //     const index = cache.findIndex(
  //       (cachedItem) => cachedItem.idExterno === fichajes[i].idExterno,
  //     );
  //     try {
  //       if (index === -1) {
  //         const trabajadorAux =
  //           await this.trabajadoresInstance.getTrabajadorBySqlId(
  //             fichajes[i].idExterno,
  //           );
  //         fichajes[i].nombre = trabajadorAux.nombreApellidos;
  //         fichajes[i].dni = trabajadorAux.dni;
  //         cache.push(fichajes[i]);
  //       } else {
  //         fichajes[i].nombre = cache[index].nombre;
  //         fichajes[i].dni = cache[index].dni;
  //       }
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   }
  //   await this.fichajesInstance.setAllFichajes(fichajes);
  //   return "OK";
  // }

  // @Post("insertEmpresa")
  // async insertEmpresa() {
  //   const empresas = await axios.post("http://localhost:3001/test/getEmpresas");

  //   return await this.prismaService.empresa.createMany({
  //     data: empresas.data,
  //   });
  // }

  // @Post("insertTiendas")
  // async insertTiendas() {
  //   const tiendas = await axios.post("http://localhost:3001/test/getTiendas");

  //   return await this.prismaService.tienda.createMany({
  //     data: tiendas.data,
  //   });
  // }

  // @Post("insertTrabajadores")
  // async insertTrabajadores() {
  //   const trabajadores = await axios.post(
  //     "http://localhost:3001/test/getTrabajadores",
  //   );

  //   return await this.prismaService.trabajador.createMany({
  //     data: trabajadores.data,
  //   });
  // }

  // @Post("insertContratos")
  // async insertContratos() {
  //   const contratos = await axios.post(
  //     "http://localhost:3001/test/getContrato",
  //   );

  //   return await this.prismaService.contrato.createMany({
  //     data: contratos.data,
  //   });
  // }

  // @Post("insertEquipos")
  // async insertEquipos() {
  //   const equipos = await axios.post("http://localhost:3001/test/getEquipos");

  //   return await this.prismaService.equipo.createMany({
  //     data: equipos.data,
  //   });
  // }

  // @Post("insertPermisos")
  // async inserPermisos() {
  //   const permisos = await axios.post("http://localhost:3001/test/getPermisos");

  //   return await this.prismaService.permiso.createMany({
  //     data: permisos.data,
  //   });
  // }

  // @Post("insertRoles")
  // async insertRoles() {
  //   const roles = await axios.post("http://localhost:3001/test/getRoles");

  //   return await this.prismaService.role.createMany({
  //     data: roles.data,
  //   });
  // }

  // @Post("insertPermisoToRole")
  // async insertPermisoToRole() {
  //   const permisoToRole = await axios.post(
  //     "http://localhost:3001/test/getPermisoToRole",
  //   );

  //   for (let i = 0; i < permisoToRole.data.length; i++) {
  //     await this.prismaService.$queryRawUnsafe(`
  //       INSERT INTO "_PermisoToRole" ("A", "B") VALUES ('${permisoToRole.data[i].A}', '${permisoToRole.data[i].B}');
  //     `);
  //   }

  //   return true;
  //   // return await this.prismaService.role.createMany({
  //   //   data: roles.data,
  //   // });
  // }

  // @Post("getEmpresas")
  // async getEmpresas() {
  //   const empresas = await this.prismaService.empresa.findMany();
  //   return empresas;
  // }

  // @Post("getTiendas")
  // async getTiendas() {
  //   const tiendas = await this.prismaService.tienda.findMany();
  //   return tiendas;
  // }

  // @Post("getTrabajadores")
  // async getTrabajadores() {
  //   const trabajadores = await this.prismaService.trabajador.findMany();
  //   return trabajadores;
  // }

  // @Post("getContrato")
  // async getContrato() {
  //   const contrato = await this.prismaService.contrato.findMany();
  //   return contrato;
  // }

  // @Post("getEquipos")
  // async getEquipos() {
  //   const equipos = await this.prismaService.equipo.findMany();
  //   return equipos;
  // }

  // @Post("getPermisos")
  // async getPermisos() {
  //   const permisos = await this.prismaService.permiso.findMany();
  //   return permisos;
  // }

  // @Post("getRoles")
  // async getRoles() {
  //   const roles = await this.prismaService.role.findMany();
  //   return roles;
  // }

  // @Post("getPermisoToRole")
  // async getPermisoToRole() {
  //   const roles = await this.prismaService.$queryRawUnsafe(`
  //     select * from _PermisoToRole;
  //   `);
  //   return roles;
  // }

  // // @Post("relacionarContratos")
  // // async relacionarContratos() {
  // //   // Conectar contrato a trabajador por contrato.dni = trabajador.dni
  // //   const contratos = await this.prismaService.contrato.findMany();
  // //   const trabajadores = await this.prismaService.trabajador.findMany();

  // //   for (let i = 0; i < contratos.length; i++) {
  // //     const trabajador = trabajadores.find(
  // //       (trabajador) => trabajador.dni === contratos[i].dni,
  // //     );

  // //     if (trabajador) {
  // //       await this.prismaService.trabajador.update({
  // //         where: { id: trabajador.id },
  // //         data: {
  // //           contratos: {
  // //             connect: {
  // //               id: contratos[i].id,
  // //             },
  // //           },
  // //         },
  // //       });
  // //     }
  // //   }

  // //   return true;
  // // }

  @Post("traspasarContratos2")
  async traspaso() {
    const contratos = await this.prismaService.contrato.findMany();

    for (let i = 0; i < contratos.length; i++) {
      await this.prismaService.contrato2.create({
        data: {
          fechaAlta: contratos[i].fechaAlta,
          fechaBaja: contratos[i].fechaBaja,
          finalContrato: contratos[i].finalContrato,
          fechaAntiguedad: contratos[i].fechaAntiguedad,
          horasContrato: contratos[i].horasContrato,
          inicioContrato: contratos[i].inicioContrato,
          Trabajador: {
            connect: {
              id: contratos[i].idTrabajador,
            },
          },
        },
      });
    }

    return true;
  }

  //Añadir contratos a ausencias o actualizarlo
  // @Post("rectificarAusencias")
  // async rectificarAusencias() {
  //   const ausencias = await this.ausenciasInstance.getAusencias();
  //   const cache = [];

  //   for (let i = 0; i < ausencias.length; i += 1) {
  //     const index = cache.findIndex(
  //       (cachedItem) => cachedItem.idUsuario === ausencias[i].idUsuario,
  //     );

  //     try {
  //       let horasContrato;

  //       if (index === -1) {
  //         const trabajadorAux =
  //           await this.trabajadorInstance.getTrabajadorBySqlId(
  //             ausencias[i].idUsuario,
  //           );

  //         // Extraer horasContrato de los contratos del trabajador
  //         horasContrato =
  //           trabajadorAux.contratos && trabajadorAux.contratos.length > 0
  //             ? (trabajadorAux.contratos[0].horasContrato * 40) / 100
  //             : null;

  //         // Guardar la información en el caché para uso posterior
  //         cache.push({
  //           idUsuario: ausencias[i].idUsuario,
  //           horasContrato,
  //         });
  //       } else {
  //         // Recuperar horasContrato del caché
  //         horasContrato = cache[index].horasContrato;
  //       }

  //       // Solo actualizar si el valor de horasContrato es diferente
  //       if (ausencias[i].horasContrato !== horasContrato) {
  //         // Actualizar la ausencia en la base de datos
  //         await this.ausenciasInstance.añadirContratos(
  //           ausencias[i]._id,
  //           horasContrato,
  //         );
  //       }
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   }

  //   return "OK";
  // }
}
