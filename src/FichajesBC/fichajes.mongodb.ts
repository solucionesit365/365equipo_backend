import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { FichajeDto } from "./fichajes.interface";
import { FacTenaMssql } from "../bbdd/mssql.class";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import axios from "axios";
import { MbctokenService } from "../bussinesCentral/services/mbctoken/mbctoken.service";
import { response } from "express";


@Injectable()
export class FichajesDatabase {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly hitInstance: FacTenaMssql,
    private readonly MbctokenService: MbctokenService,
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

  async enviarFichajesBC(fichajes: FichajeDto[]) {
    try {
      let data = null;
      const token = await this.MbctokenService.getToken();

      if (fichajes.length > 0) {
        for (let i = 0; i < fichajes.length; i += 1) {
          const hora = moment(fichajes[0].hora);

          if (fichajes[i].tipo === "ENTRADA") {
            data = {
              idr: fichajes[i]._id.toString(),
              tmst: hora.toISOString(),
              accio: 1,
              usuari: fichajes[i].idExterno.toString,
              editor: "365EquipoDeTrabajo",
              historial: null,
              lloc: null,
              comentari: "365EquipoDeTrabajo",
              id: 0,
            };
          } else if (fichajes[i].tipo === "SALIDA") {
            data = {
              idr: fichajes[i]._id.toString(),
              tmst: hora.toISOString(),
              accio: 2,
              usuari: fichajes[i].idExterno.toString(),
              editor: "365EquipoDeTrabajo",
              comentari: "365EquipoDeTrabajo",
              id: 0,
            };
          }
          if (data != null) {
            const response = await axios.post(
              `https:api.businesscentral.dynamics.com/v2.0/${process.env.MBC_TOKEN_TENANT}/Production/ODataV4/Company('${process.env.MBC_COMPANY_NAME}')/cdpDadesFichador2`,
              data,
              {
                headers: {
                  Authorization: "Bearer " + token,
                  "Content-Type": "application/json",
                },
              },
            );
            if (response.status == 201) {
              const db = (await this.mongoDbService.getConexion()).db(
                "soluciones",
              );
              const fichajesCollection = db.collection<FichajeDto>("fichajes");

              const updatePromises = fichajes.map((item) =>
                fichajesCollection.updateOne(
                  { _id: item._id },
                  { $set: { enviado: true } },
                ),
              );
              await Promise.all(updatePromises);
              return { message: "Fichajes sincronizados" };
            } else {
              return response;
            }
          }
        }
      } else return { message: "No hay fichajes para enviar a BC" };
    } catch (error) {
      return { Response: error.response.data };
    }
  }

  async getFichajesHit() {
    try {
      const token = await this.MbctokenService.getToken();

      // Obtener la fecha y hora actual en UTC
      const now = DateTime.utc();
      // Formatear la fecha actual y la fecha del día siguiente en el formato ISO 8601
      const startDate = now.toISO().split("T")[0] + "T00:00:00Z";
      const endDate =
        now.plus({ days: 1 }).toISO().split("T")[0] + "T00:00:00Z";

      let response = await axios.get(
        `https://api.businesscentral.dynamics.com/v2.0/${process.env.MBC_TOKEN_TENANT}/Production/ODataV4/Company('${process.env.MBC_COMPANY_NAME}')/cdpDadesFichador2?$filter=tmst ge ${startDate} and tmst lt ${endDate} and comentari ne '365EquipoDeTrabajo'&$select=accio, usuari, idr, tmst, comentari`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.value.length > 0) {
        return response.data.value;
      } else {
        return [];
      }
    } catch (error) {
      return {
        status: 400,
        message: error.message,
      };
    }
  }

  async insertarFichajesHit(fichajes: FichajeDto[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection<FichajeDto>("fichajes2");
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
      .sort({ hora: 1 })
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

  async getPendientesTrabajadorDia(idExterno: number, fecha: DateTime) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajes = db.collection<FichajeDto>("fichajes");

    return await fichajes.findOne({
      idExterno,
      $and: [
        { hora: { $gte: fecha.startOf("day").toJSDate() } },
        { hora: { $lte: fecha.endOf("day").toJSDate() } },
      ],
    });
  }
}
