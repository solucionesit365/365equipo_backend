import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { FichajeDto } from "./fichajes.interface";
import { FacTenaMssql } from "../bbdd/mssql.class";
import * as moment from "moment";

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
        fecha: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .sort({ fecha: 1 })
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
}
