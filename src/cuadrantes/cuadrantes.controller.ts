// import {
//   Body,
//   Controller,
//   Get,
//   Post,
//   UseGuards,
//   Query,
//   HttpException,
//   HttpStatus,
//   InternalServerErrorException,
//   UnauthorizedException,
// } from "@nestjs/common";
// import { AuthGuard } from "../guards/auth.guard";
// import { Cuadrantes } from "./cuadrantes.class";
// import { TCuadrante, TRequestCuadrante } from "./cuadrantes.interface";
// import { SchedulerGuard } from "../guards/scheduler.guard";
// import { TrabajadorService } from "../trabajadores/trabajadores.class";
// import { DateTime } from "luxon";
// import { ObjectId } from "mongodb";
// import { ContratoService } from "../contrato/contrato.service";
// import { User } from "../decorators/get-user.decorator";
// import { UserRecord } from "firebase-admin/auth";
// import {
//   CopiarSemanaCuadranteDto,
//   GetCuadranteIndividual,
//   GetCuadrantesDto,
//   GetCuadranteTiendaSemanal,
// } from "./cuadrantes.dto";
// import { Notificaciones } from "../notificaciones/notificaciones.class";
// import { LoggerService } from "../logger/logger.service";
// import { CompleteUser } from "../decorators/getCompleteUser.decorator";
// import { Trabajador } from "@prisma/client";

// @Controller("cuadrantes")
// export class CuadrantesController {
//   constructor(
//     private readonly cuadrantesInstance: Cuadrantes,
//     private readonly contratoService: ContratoService,
//     private readonly trabajadoresInstance: TrabajadorService,
//     private readonly notificacionesInstance: Notificaciones,
//     private readonly loggerService: LoggerService,
//   ) {}

//   @UseGuards(AuthGuard)
//   @Get()
//   async getCuadrantes(
//     @Query() req: GetCuadrantesDto,
//     @CompleteUser() user: Trabajador,
//   ) {
//     try {
//       const usuarioCompleto =
//         await this.trabajadoresInstance.getTrabajadorByAppId(user.idApp);

//       const tipoEmpleado = this.cuadrantesInstance.getRole(usuarioCompleto);
//       let cuadrantes: TCuadrante[] = [];

//       if (tipoEmpleado === "DEPENDIENTA") {
//         cuadrantes = await this.cuadrantesInstance.getCuadranteDependienta(
//           usuarioCompleto.id,
//           DateTime.fromISO(req.fecha),
//         );
//       }

//       if (user.esTienda) {
//         // Si es una tienda, se obtiene el cuadrante de la tienda por su idTienda
//         cuadrantes = await this.cuadrantesInstance.getCaudrantesEquipo(
//           usuarioCompleto.idTienda,
//           DateTime.fromISO(req.fecha),
//         );
//       }

//       if (tipoEmpleado === "COORDINADORA") {
//         const arrayEquipo = await this.trabajadoresInstance.getSubordinadosById(
//           usuarioCompleto.id,
//         );
//         const arrayIdEquipo = arrayEquipo.map(
//           (trabajadorSubordinado) => trabajadorSubordinado.id,
//         );

//         cuadrantes = await this.cuadrantesInstance.getCuadranteCoordinadora(
//           usuarioCompleto.id,
//           arrayIdEquipo,
//           DateTime.fromISO(req.fecha),
//           usuarioCompleto.idTienda,
//         );
//       }

//       if (tipoEmpleado === "SUPERVISORA" && req.idTienda) {
//         cuadrantes = await this.cuadrantesInstance.getCuadranteSupervisora(
//           req.idTienda,
//           DateTime.fromISO(req.fecha),
//         );
//       }

//       if (req.idTienda) {
//         // Esto es tratado como Dependienta también, se obtiene el cuadrante de la tienda por su idTienda
//         const cuadrantesTienda = await this.cuadrantesInstance.getTiendasSemana(
//           req.idTienda,
//           DateTime.fromISO(req.fecha),
//         );

//         // Fusionar cuadrantesTienda con cuadrantes sin duplicados según _id
//         const idsExistentes = new Set(cuadrantes.map((c) => c._id.toString()));
//         const cuadrantesUnicos = cuadrantesTienda.filter(
//           (cuadrante) => !idsExistentes.has(cuadrante._id.toString()),
//         );

//         cuadrantes = [...cuadrantes, ...cuadrantesUnicos];
//       }

//       return {
//         ok: true,
//         data: cuadrantes,
//       };
//     } catch (err) {
//       console.log(err);
//       return { ok: false, message: err.message };
//     }
//   }

//   @UseGuards(AuthGuard)
//   @Get("individual")
//   async getCuadrantesIndividual(
//     @Query() req: GetCuadranteIndividual,
//     @User() user: UserRecord,
//   ) {
//     // Usa el UID de la Coordinadora_A si lo recibe en la petición, sino usa el del usuario actual
//     const uidParaConsultar = req.uid || user.uid;
//     const usuarioCompleto =
//       await this.trabajadoresInstance.getTrabajadorByAppId(uidParaConsultar);

//     if (!usuarioCompleto.llevaEquipo || !usuarioCompleto.idTienda)
//       throw new UnauthorizedException();
//     const fechaInicio = DateTime.fromISO(req.fecha).startOf("week");
//     const fechaFinal = fechaInicio.endOf("week");

//     return this.cuadrantesInstance.getCuadrantesIndividual(
//       req.idTrabajador,
//       fechaInicio,
//       fechaFinal,
//     );
//   }

//   @UseGuards(AuthGuard)
//   @Get("getNewId")
//   getNewId() {
//     return new ObjectId();
//   }

//   @UseGuards(AuthGuard)
//   @Post("borrarTurno")
//   async borrarTurno(@Body() { idTurno }) {
//     try {
//       if (idTurno) {
//         return {
//           ok: await this.cuadrantesInstance.borrarTurno(idTurno),
//         };
//       } else throw Error("Faltan parámetros");
//     } catch (err) {
//       console.log(err);
//       return { ok: false, message: err.message };
//     }
//   }

//   @UseGuards(AuthGuard)
//   @Get("getTodos")
//   async getAllCuadrantes() {
//     try {
//       return {
//         ok: true,
//         data: await this.cuadrantesInstance.getTodo(),
//       };
//     } catch (err) {
//       console.log(err);
//       return { ok: false, message: err.message };
//     }
//   }

//   //Todas las tiendas 1 semana
//   @UseGuards(AuthGuard)
//   @Get("getTiendasUnaSemana")
//   async getTiendas1Semana(@Query() req: GetCuadranteTiendaSemanal) {
//     return await this.cuadrantesInstance.getTiendas1Semana(
//       DateTime.fromISO(req.fecha),
//     );
//   }

//   @UseGuards(AuthGuard)
//   @Get("getCuadranteSupers")
//   async getTiendasSemana(
//     @Query() { idTienda, fecha }: { idTienda: number; fecha: string },
//   ) {
//     try {
//       if (!fecha) throw Error("Faltan datos");
//       return {
//         ok: true,
//         data: await this.cuadrantesInstance.getTiendasSemana(
//           Number(idTienda),
//           DateTime.fromJSDate(new Date(fecha)),
//         ),
//       };
//     } catch (err) {
//       console.log(err);
//       return { ok: false, message: err.message };
//     }
//   }

//   //Todas las semanas 1 tienda
//   @UseGuards(AuthGuard)
//   @Get("getTiendaTodasSemanas")
//   async getSemanas1Tienda(@Query() { idTienda }: { idTienda: number }) {
//     try {
//       if (!idTienda) throw Error("Faltan datos");
//       return {
//         ok: true,
//         data: await this.cuadrantesInstance.getSemanas1Tienda(Number(idTienda)),
//       };
//     } catch (error) {
//       console.log(error);
//       return { ok: false, message: error.message };
//     }
//   }

//   //obtener cuadrantes por semana y trabajador:
//   @UseGuards(AuthGuard)
//   @Get("cuadranteSemanaTrabajador")
//   async getCuadranteSemanaTrabajador(
//     @Query()
//     { idTrabajador, fecha }: { idTrabajador: number; fecha: string },
//   ) {
//     try {
//       if (!idTrabajador && !fecha) throw Error("Faltan datos");
//       return {
//         ok: true,
//         data: await this.cuadrantesInstance.getCuadranteSemanaTrabajador(
//           Number(idTrabajador),
//           DateTime.fromJSDate(new Date(fecha)),
//         ),
//       };
//     } catch (error) {
//       console.log(error);
//       return { ok: false, message: error.message };
//     }
//   }

//   private convertToLuxon = (
//     hourString: string,
//     // dayOffset: number,
//   ): DateTime => {
//     // Obtener el lunes de la semana actual
//     // const mondayThisWeek = DateTime.now().startOf("week").plus({ days: 1 });

//     // const [hour, minute] = hourString.split(":").map(Number);

//     // return mondayThisWeek.plus({
//     //   days: dayOffset,
//     //   hours: hour,
//     //   minutes: minute,
//     // });
//     return DateTime.fromJSDate(new Date(hourString));
//   };

//   @UseGuards(AuthGuard)
//   @Post("saveCuadrante")
//   async saveCuadrante(
//     @Body("uid") uid: string,
//     @Body() reqCuadrante: TRequestCuadrante,
//     @CompleteUser() user: Trabajador,
//   ) {
//     try {
//       if (!reqCuadrante) throw Error("Faltan datos");
//       const uidParaConsultar = uid || user.idApp;
//       const usuarioCompleto =
//         await this.trabajadoresInstance.getTrabajadorByAppId(uidParaConsultar);

//       const trabajadorEditado =
//         await this.trabajadoresInstance.getTrabajadorBySqlId(
//           reqCuadrante.idTrabajador,
//         );

//       if (usuarioCompleto.llevaEquipo && usuarioCompleto.idTienda) {
//         const fechaInicio = DateTime.fromJSDate(
//           new Date(reqCuadrante.fecha),
//         ).startOf("week");
//         const fechaFinal = fechaInicio.endOf("week");

//         // Para saber si hay que actualizar o insertar nuevo
//         const oldCuadrante =
//           await this.cuadrantesInstance.getCuadrantesIndividual(
//             reqCuadrante.idTrabajador,
//             fechaInicio,
//             fechaFinal,
//           );

//         const newArraySemanalHoras: TRequestCuadrante["arraySemanalHoras"] =
//           reqCuadrante.arraySemanalHoras.map((day) => ({
//             ...day,
//             horaEntrada: this.convertToLuxon(day.horaEntrada as string),
//             horaSalida: this.convertToLuxon(day.horaSalida as string),
//           }));

//         reqCuadrante.arraySemanalHoras = newArraySemanalHoras;

//         const cuadrantesDiarios: TCuadrante[] = [];
//         // Creo los cuadrantes diarios a partir del arraySemanal:
//         for (let i = 0; i < reqCuadrante.arraySemanalHoras.length; i += 1) {
//           if (
//             (reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime).equals(
//               reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime,
//             )
//           ) {
//             await this.cuadrantesInstance.borrarTurnoByPlan(
//               reqCuadrante.arraySemanalHoras[i].idPlan,
//             );
//             continue;
//           }

//           const horasContractuales =
//             (await this.contratoService.getHorasContratoByIdNew(
//               reqCuadrante.idTrabajador,
//               fechaInicio,
//             )) as number;
//           const bolsaHorasInicial =
//             await this.cuadrantesInstance.getBolsaHorasById(
//               reqCuadrante.idTrabajador,
//               reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime,
//               horasContractuales,
//             );
//           cuadrantesDiarios.push({
//             _id: reqCuadrante.arraySemanalHoras[i].idCuadrante
//               ? new ObjectId(reqCuadrante.arraySemanalHoras[i].idCuadrante)
//               : null, // Se creará al insertar con bulkwrite
//             idTrabajador: reqCuadrante.idTrabajador,
//             idPlan: reqCuadrante.arraySemanalHoras[i].idPlan
//               ? reqCuadrante.arraySemanalHoras[i].idPlan
//               : new ObjectId().toString(),
//             idTienda: reqCuadrante.arraySemanalHoras[i].idTienda
//               ? reqCuadrante.arraySemanalHoras[i].idTienda
//               : reqCuadrante.idTiendaDefault,
//             inicio: (
//               reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime
//             ).toJSDate(),
//             final: (
//               reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime
//             ).toJSDate(),
//             nombre: trabajadorEditado.nombreApellidos,
//             totalHoras: Math.abs(
//               (reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime).diff(
//                 reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime,
//                 "hours",
//               ).hours,
//             ),
//             enviado: false,
//             historialPlanes: [],
//             horasContrato: horasContractuales,
//             ausencia: null,
//             bolsaHorasInicial: bolsaHorasInicial,
//             borrable: reqCuadrante.arraySemanalHoras[i].borrable ? true : false,
//           });
//         }

//         /* Pasar a individual */

//         if (
//           await this.cuadrantesInstance.saveCuadrante(
//             cuadrantesDiarios,
//             oldCuadrante,
//           )
//         ) {
//           const trabajadorID =
//             await this.trabajadoresInstance.getTrabajadorBySqlId(
//               reqCuadrante.idTrabajador,
//             );

//           // if (trabajadorID.idApp) {
//           //   const token = await this.notificacionesInstance.getFCMToken(
//           //     trabajadorID.idApp,
//           //   );
//           //   if (token && token.token) {
//           //     await this.notificacionesInstance.sendNotificationToDevice(
//           //       token.token,
//           //       "NUEVO CUADRANTE CREADO",
//           //       `Se ha creado el cuadrate de la semana ${fechaInicio.weekNumber}`,
//           //       "/cuadrantes-tienda",
//           //     );
//           //   }
//           // }

//           this.loggerService.create({
//             action: "Crea un cuadrante",
//             name: `${user.nombreApellidos} crea un cuadrante para ${trabajadorID.nombreApellidos}`,
//           });

//           return { ok: true };
//         }
//       }
//       throw Error("No llevas equipo o tienda para realizar esta acción");
//     } catch (err) {
//       console.log(err);
//       return { ok: false, message: err.message };
//     }
//   }

//   @UseGuards(AuthGuard)
//   @Post("copiarSemanaCuadrante")
//   async copiarSemanaCuadrante(@Body() reqCopiar: CopiarSemanaCuadranteDto) {
//     return this.cuadrantesInstance.copiarSemanaCuadrante(reqCopiar);
//   }

//   @UseGuards(SchedulerGuard)
//   @Post("sincronizarConHit")
//   async sincronizarConHit() {
//     try {
//       return {
//         ok: true,
//         // data: await this.cuadrantesInstance.sincronizarConHit(),
//       };
//     } catch (err) {
//       console.log(err);
//       throw new HttpException(
//         {
//           status: HttpStatus.INTERNAL_SERVER_ERROR,
//           error: "Error interno del servidor",
//           message: err.message,
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }
