// import { Injectable } from "@nestjs/common";
// import { MongoService } from "../mongo/mongo.service";
// import { FichajeDto } from "./fichajes.interface";
// import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
// import * as moment from "moment";
// import { ObjectId } from "mongodb";
// import { DateTime } from "luxon";

// @Injectable()
// export class FichajesDatabase {
//   constructor(
//     private readonly mongoDbService: MongoService,
//     private readonly hitMssqlService: HitMssqlService,
//   ) {}

//   async nuevaEntrada(
//     uid: string,
//     hora: Date,
//     idExterno: number,
//     nombre: string,
//     dni: string,
//   ) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");
//     const resInsert = await fichajesCollection.insertOne({
//       enviado: false,
//       hora,
//       tipo: "ENTRADA",
//       uid,
//       idExterno,
//       validado: false,
//       nombre,
//       dni,
//     });

//     if (resInsert.acknowledged) return resInsert.insertedId;
//     return null;
//   }

//   async nuevaSalida(
//     uid: string,
//     hora: Date,
//     idExterno: number,
//     nombre: string,
//     dni: string,
//   ) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");
//     const resInsert = await fichajesCollection.insertOne({
//       enviado: false,
//       hora,
//       tipo: "SALIDA",
//       uid,
//       idExterno,
//       validado: false,
//       nombre,
//       dni,
//     });

//     if (resInsert.acknowledged) return resInsert.insertedId;
//     return null;
//   }

//   async getFichajesDia(uid: string, fecha: Date) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");
//     const startOfDay = new Date(fecha);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(startOfDay);
//     endOfDay.setDate(endOfDay.getDate() + 1);

//     // Busca los documentos que coincidan con el rango de fechas
//     return await fichajesCollection
//       .find({
//         uid,
//         hora: {
//           $gte: startOfDay,
//           $lt: endOfDay,
//         },
//       })
//       .sort({ hora: 1 })
//       .toArray();
//   }

//   async getFichajesSincro() {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     return await fichajesCollection.find({ enviado: false }).toArray();
//   }

//   async enviarHit(fichajes: FichajeDto[]) {
//     let sql = "";

//     for (let i = 0; i < fichajes.length; i += 1) {
//       const hora = moment(fichajes[0].hora);

//       if (fichajes[i].tipo === "ENTRADA") {
//         sql += `
//         DELETE FROM cdpDadesFichador WHERE idr = '${fichajes[
//           i
//         ]._id.toString()}';
//         INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) 
//         VALUES (0, CONVERT(datetime, '${hora.format(
//           "YYYY-MM-DD HH:mm:ss",
//         )}', 120), 1, ${fichajes[i].idExterno}, '${
//           fichajes[i]._id
//         }', NULL, '365EquipoDeTrabajo')
//         `;
//       } else if (fichajes[i].tipo === "SALIDA") {
//         sql += `
//         DELETE FROM cdpDadesFichador WHERE idr = '${fichajes[i]._id}';
//         INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) 
//         VALUES (0, CONVERT(datetime, '${hora.format(
//           "YYYY-MM-DD HH:mm:ss",
//         )}', 120), 2, ${fichajes[i].idExterno}, '${fichajes[
//           i
//         ]._id.toString()}', NULL, '365EquipoDeTrabajo')
//         `;
//       }
//     }

//     if (sql === "") return 0;

//     await this.hitMssqlService.recHit(sql);

//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     const updatePromises = fichajes.map((item) =>
//       fichajesCollection.updateOne(
//         { _id: item._id },
//         { $set: { enviado: true } },
//       ),
//     );
//     await Promise.all(updatePromises);
//   }

//   async getFichajesHit() {
//     const fechaActual = new Date();

//     const day = fechaActual.getDate();
//     const month = fechaActual.getMonth() + 1;
//     const year = fechaActual.getFullYear();

//     const sql = `SELECT df.accio, df.usuari, df.idr, CONVERT(nvarchar, df.tmst, 126) as tmst, df.comentari as comentario, (select nom from dependentes where codi = df.usuari) as nombre, (SELECT valor FROM dependentesExtes WHERE id = df.usuari AND nom = 'DNI') as dni FROM cdpDadesFichador df WHERE day(df.tmst) = ${day} AND month(df.tmst) = ${month} AND year(df.tmst) = ${year} AND df.comentari <> '365EquipoDeTrabajo'`;

//     const resFichajes = await this.hitMssqlService.recHit(sql);

//     return []; //resFichajes.recordset;
//   }

//   async insertarFichajesHit(fichajes: FichajeDto[]) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     try {
//       await fichajesCollection.insertMany(fichajes, {
//         ordered: false,
//       });
//     } catch (error) {
//       if (
//         error.code === 11000 ||
//         (error.writeErrors && error.writeErrors.some((e) => e.code === 11000))
//       ) {
//         console.log(
//           "Se ignoraron los documentos duplicados y se insertaron los nuevos",
//         );
//       } else {
//         throw Error(error);
//       }
//     }
//   }

//   async getFichajesByIdSql(idSql: number, validado: boolean) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     return await fichajesCollection
//       .find({ idExterno: idSql, validado: validado })
//       .sort({ hora: 1 })
//       .toArray();
//   }

//   async getFichajesByUid(uid: string, fechaInicio: Date, fechaFinal: Date) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     return await fichajesCollection
//       .find({
//         uid,
//         hora: {
//           $gte: fechaInicio,
//           $lt: fechaFinal,
//         },
//       })
//       .sort({ hora: 1 })
//       .toArray();
//   }

//   async updateFichaje(id: string, validado: boolean) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const anuncios = db.collection("fichajes");
//     let idEnviar = null;
//     if (id?.length === 24) {
//       idEnviar = new ObjectId(id);
//     } else {
//       idEnviar = id;
//     }
//     const resUpdate = await anuncios.updateOne(
//       {
//         _id: idEnviar,
//       },
//       {
//         $set: {
//           validado: validado,
//         },
//       },
//     );

//     return resUpdate.acknowledged;
//   }

//   async getPendientesTrabajadorDia(idExterno: number, fecha: DateTime) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajes = db.collection<FichajeDto>("fichajes");

//     return await fichajes.findOne({
//       idExterno,
//       $and: [
//         { hora: { $gte: fecha.startOf("day").toJSDate() } },
//         { hora: { $lte: fecha.endOf("day").toJSDate() } },
//       ],
//     });
//   }

//   // Solo para propósitos de rectificación general
//   async getAllFichajes() {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajes = db.collection<FichajeDto>("fichajes");

//     // Solo el último mes (campo "hora")
//     return await fichajes
//       .find({
//         hora: {
//           $gte: DateTime.now().minus({ months: 3 }).toJSDate(),
//         },
//       })
//       .toArray();
//   }

//   // Solo para propósitos de rectificación general. (Borrar primero todo y luego insertar)
//   async setAllFichajes(fichajes: FichajeDto[]) {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajesCollection = db.collection<FichajeDto>("fichajes");

//     await fichajesCollection.deleteMany({});
//     await fichajesCollection.insertMany(fichajes);
//   }

//   async validarFichajesAntiguos(inicioSemanaAnterior: DateTime): Promise<any> {
//     const db = (await this.mongoDbService.getConexion()).db("soluciones");
//     const fichajes = db.collection<FichajeDto>("fichajes");

//     const response = fichajes.updateMany(
//       {
//         hora: { $lt: inicioSemanaAnterior.toJSDate() },
//         validado: false,
//       },
//       { $set: { validado: true } },
//     );
//     return response;
//   }
// }
