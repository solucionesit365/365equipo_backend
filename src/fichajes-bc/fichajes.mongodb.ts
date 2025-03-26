import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { FichajeDto } from "./fichajes.interface";
// import { FacTenaMssql } from "../bbdd/mssql.class";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import axios from "axios";
import { MbctokenService } from "../bussinesCentral/services/mbctoken/mbctoken.service";

@Injectable()
export class FichajesDatabase {
  constructor(
    private readonly mongoDbService: MongoService,
    private readonly mbctokenService: MbctokenService, // private readonly hitInstance: FacTenaMssql,
  ) {}

  async nuevaEntrada(
    uid: string,
    hora: Date,
    idExterno: number,
    nombre: string,
    dni: string,
    latitud?: number,
    longitud?: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "ENTRADA",
      uid,
      idExterno,
      validado: false,
      nombre,
      dni,
      geolocalizacion:
        latitud !== undefined && longitud !== undefined
          ? { latitud, longitud }
          : undefined,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async nuevaSalida(
    uid: string,
    hora: Date,
    idExterno: number,
    nombre: string,
    dni: string,
    latitud?: number, // Añadir latitud
    longitud?: number, // Añadir longitud
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "SALIDA",
      uid,
      idExterno,
      validado: false,
      nombre,
      dni,
      geolocalizacion:
        latitud !== undefined && longitud !== undefined
          ? { latitud, longitud }
          : undefined,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async nuevoInicioDescanso(
    uid: string,
    hora: Date,
    idExterno: number,
    nombre: string,
    dni: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "INICIO_DESCANSO",
      uid,
      idExterno,
      validado: false,
      nombre,
      dni,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async nuevoFinalDescanso(
    uid: string,
    hora: Date,
    idExterno: number,
    nombre: string,
    dni: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");
    const resInsert = await fichajesCollection.insertOne({
      enviado: false,
      hora,
      tipo: "FINAL_DESCANSO",
      uid,
      idExterno,
      validado: false,
      nombre,
      dni,
    });

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getFichajesDia(uid: string, fecha: Date) {
    const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection.find({ enviado: false }).toArray();
  }

  async enviarFichajesBC(fichajes: FichajeDto[]) {
    try {
      const token = await this.mbctokenService.getToken(
        process.env.MBC_TOKEN_CLIENTID,
        process.env.MBC_TOKEN_CLIENT_SECRET,
      );

      if (fichajes.length > 0) {
        for (let i = 0; i < fichajes.length; i += 1) {
          const hora = moment(fichajes[i].hora);
          const data = {
            idr: fichajes[i]._id.toString(),
            tmst: hora.toISOString(),
            accio: fichajes[i].tipo === "ENTRADA" ? 1 : 2,
            usuari: fichajes[i].idExterno.toString(),
            editor: "365EquipoDeTrabajo",
            historial: null,
            lloc: null,
            nombre: null,
            dni: null,
            comentari: "365EquipoDeTrabajo",
            id: 0,
          };

          try {
            const response = await axios.post(
              `https://api.businesscentral.dynamics.com/v2.0/${process.env.MBC_TOKEN_TENANT}/Production/ODataV4/Company('${process.env.MBC_COMPANY_NAME_PROD}')/cdpDadesFichador2`,
              data,
              {
                headers: {
                  Authorization: "Bearer " + token,
                  "Content-Type": "application/json",
                },
              },
            );

            if (response.status == 201) {
              console.log(response);

              const db = (await this.mongoDbService.getConexion()).db();
              const fichajesCollection = db.collection<FichajeDto>("fichajes");
              const resp = await fichajesCollection.updateOne(
                { _id: fichajes[i]._id },
                { $set: { enviado: true } },
              );
              console.log(resp);
            } else {
              console.error(`Failed to send record ${fichajes[i]._id}`);
            }
          } catch (error) {
            console.error(
              `Error sending record ${fichajes[i]._id}`,
              error.response?.data || error.message,
            );
          }
        }

        return { message: "Fichajes sincronizados" };
      } else {
        return { message: "No hay fichajes para enviar a BC" };
      }
    } catch (error) {
      return { Response: error.response?.data || error.message };
    }
  }

  async getFichajesBC() {
    try {
      const token = await this.mbctokenService.getToken(
        process.env.MBC_TOKEN_CLIENTID,
        process.env.MBC_TOKEN_CLIENT_SECRET,
      );

      // Obtener la fecha y hora actual en UTC
      const now = DateTime.utc();
      // Formatear la fecha actual y la fecha del día siguiente en el formato ISO 8601
      const startDate = now.toISO().split("T")[0] + "T00:00:00Z";
      const endDate =
        now.plus({ days: 1 }).toISO().split("T")[0] + "T00:00:00Z";

      const response = await axios.get(
        `https://api.businesscentral.dynamics.com/v2.0/${process.env.MBC_TOKEN_TENANT}/Production/ODataV4/Company('${process.env.MBC_COMPANY_NAME_PROD}')/cdpDadesFichador2?$filter=tmst ge ${startDate} and tmst lt ${endDate} and comentari ne '365EquipoDeTrabajo' and dni ne null&$select=accio, usuari, idr, tmst, comentari, nombre, dni`,
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

  async getNominas() {
    const token = await this.mbctokenService.getToken(
      process.env.MBC_TOKEN_CLIENTID,
      process.env.MBC_TOKEN_CLIENT_SECRET,
    );

    const response = await axios.get(
      `https://api.businesscentral.dynamics.com/v2.0/${process.env.MBC_TOKEN_TENANT}/Production/ODataV4/Company('${process.env.MBC_COMPANY_NAME_PROD}')/archivo`,
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
  }
  catch(error) {
    return {
      status: 400,
      message: error.message,
    };
  }

  async insertarFichajesHit(fichajes: FichajeDto[]) {
    const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({ idExterno: idSql, validado: validado })
      .sort({ hora: 1 })
      .toArray();
  }

  async getFichajesByUid(uid: string, fechaInicio: Date, fechaFinal: Date) {
    const db = (await this.mongoDbService.getConexion()).db();
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

  async getFichajesByUidInverso(
    uid: string,
    fechaInicio: Date,
    fechaFinal: Date,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({
        uid,
        hora: {
          $gte: fechaInicio,
          $lt: fechaFinal,
        },
      })
      .sort({ hora: -1 })
      .toArray();
  }

  async getDescansosTrabajadorDia(
    inicio: DateTime,
    final: DateTime,
    uid: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({
        uid,
        hora: {
          $gte: inicio.toJSDate(),
          $lt: final.toJSDate(),
        },
        tipo: {
          $in: ["INICIO_DESCANSO", "FINAL_DESCANSO"],
        },
      })
      .sort({ hora: 1 })
      .toArray();
  }

  async updateFichaje(id: string, validado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajes = db.collection<FichajeDto>("fichajes");

    return await fichajes.findOne({
      idExterno,
      $and: [
        { hora: { $gte: fecha.startOf("day").toJSDate() } },
        { hora: { $lte: fecha.endOf("day").toJSDate() } },
      ],
    });
  }

  // Solo para propósitos de rectificación general
  async getAllFichajes() {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajes = db.collection<FichajeDto>("fichajes");

    // Solo el último mes (campo "hora")
    return await fichajes
      .find({
        hora: {
          $gte: DateTime.now().minus({ months: 3 }).toJSDate(),
        },
      })
      .toArray();
  }

  // Solo para propósitos de rectificación general. (Borrar primero todo y luego insertar)
  async setAllFichajes(fichajes: FichajeDto[]) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    await fichajesCollection.deleteMany({});
    await fichajesCollection.insertMany(fichajes);
  }

  async validarFichajesAntiguos(inicioSemanaAnterior: DateTime): Promise<any> {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajes = db.collection<FichajeDto>("fichajes");

    const response = fichajes.updateMany(
      {
        hora: { $lt: inicioSemanaAnterior.toJSDate() },
        validado: false,
      },
      { $set: { validado: true } },
    );
    return response;
  }
  async getFichajes(idSql: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const fichajesCollection = db.collection<FichajeDto>("fichajes");

    return await fichajesCollection
      .find({ idExterno: idSql })
      .sort({ hora: 1 })
      .toArray();
  }
}
