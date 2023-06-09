import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { FichajeDto } from "./fichajes.interface";
import { FacTenaMssql } from "../bbdd/mssql.class";
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class FichajesDatabase {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly hitInstance: FacTenaMssql,
  ) {}

  async nuevaEntrada(uid: string, hora: Date, idExterno: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "ENTRADA",
      uid,
      idExterno,
      validado: false,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async nuevaSalida(uid: string, hora: Date, idExterno: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "SALIDA",
      uid,
      idExterno,
      validado: false,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getFichajesDia(uid: string, fecha: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Busca los documentos que coincidan con el rango de fechas
    return await fichajesCollection
      .find({
        uid,
        hora: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .sort({ hora: 1 })
      .toArray();
  }

  async getFichajesSincro() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection.find({ enviado: false }).toArray();
  }

  async enviarHit(fichajes: FichajeDto[]) {
    let sql = "";

    for (let i = 0; i < fichajes.length; i += 1) {
      const hora = moment(fichajes[0].hora);

      if (fichajes[i].tipo === "ENTRADA") {
        sql += `
        DELETE FROM cdpDadesFichador WHERE idr = '${fichajes[
          i
        ]._id.toString()}';
        INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) 
        VALUES (0, CONVERT(datetime, '${hora.format(
          "YYYY-MM-DD HH:mm:ss",
        )}', 120), 1, ${fichajes[i].idExterno}, '${
          fichajes[i]._id
        }', NULL, '365EquipoDeTrabajo')
        `;
      } else if (fichajes[i].tipo === "SALIDA") {
        sql += `
        DELETE FROM cdpDadesFichador WHERE idr = '${fichajes[i]._id}';
        INSERT INTO cdpDadesFichador (id, tmst, accio, usuari, idr, lloc, comentari) 
        VALUES (0, CONVERT(datetime, '${hora.format(
          "YYYY-MM-DD HH:mm:ss",
        )}', 120), 2, ${fichajes[i].idExterno}, '${fichajes[
          i
        ]._id.toString()}', NULL, '365EquipoDeTrabajo')
        `;
      }
    }

    if (sql === "") return 0;

    await this.hitInstance.recHit(sql);

    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    const updatePromises = fichajes.map((item) =>
      fichajesCollection.updateOne(
        { _id: item._id },
        { $set: { enviado: true } },
      ),
    );
    await Promise.all(updatePromises);
  }

  async getFichajesHit() {
    const fechaActual = new Date();

    const day = fechaActual.getDate();
    const month = fechaActual.getMonth() + 1;
    const year = fechaActual.getFullYear();

    const sql = `SELECT accio, usuari, idr, CONVERT(nvarchar, tmst, 126) as tmst, comentari as comentario FROM cdpDadesFichador WHERE day(tmst) = ${day} AND month(tmst) = ${month} AND year(tmst) = ${year} AND comentari <> '365EquipoDeTrabajo'`;

    const resFichajes = await this.hitInstance.recHit(sql);

    return resFichajes.recordset;
  }

  async insertarFichajesHit(fichajes: FichajeDto[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    try {
      await fichajesCollection.insertMany(fichajes, {
        ordered: false,
      });
    } catch (error) {
      if (
        error.code === 11000 ||
        (error.writeErrors && error.writeErrors.some((e) => e.code === 11000))
      ) {
        console.log(
          "Se ignoraron los documentos duplicados y se insertaron los nuevos",
        );
      } else {
        throw Error(error);
      }
    }
  }

  async getFichajesByIdSql(idSql: number, validado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({ idExterno: idSql, validado: validado })
      .toArray();
  }

  async getFichajesByUid(uid: string, fechaInicio: Date, fechaFinal: Date) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({
        uid,
        hora: {
          $gte: fechaInicio,
          $lt: fechaFinal,
        },
      })
      .sort({ hora: 1 })
      .toArray();
  }

  async updateFichaje(id: string, validado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection("fichajes");
    let idEnviar = null;
    if (id?.length === 24) {
      idEnviar = new ObjectId(id);
    } else {
      idEnviar = id;
    }
    const resUpdate = await anuncios.updateOne(
      {
        _id: idEnviar,
      },
      {
        $set: {
          validado: validado,
        },
      },
    );

    return resUpdate.acknowledged;
  }
}
