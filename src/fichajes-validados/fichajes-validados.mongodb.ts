import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import { FichajeValidadoDto } from "./fichajes-validados.dto";

@Injectable()
export class FichajesValidadosDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async getTodos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection = db.collection("fichajesValidados");

    return await fichajesCollection.find({}).toArray();
  }

  async insertFichajesValidadosRectificados(data: FichajeValidadoDto[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection.insertMany(data);
  }

  async insertarFichajeValidado(fichajeValidado: FichajeValidadoDto) {
    fichajeValidado._id = new ObjectId().toString();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");
    const resInsert = await cuadrantesCollection.insertOne(fichajeValidado);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getFichajesValidados(idTrabajador: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection.find({ idTrabajador }).toArray();
  }

  async getPendientesEnvio() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection.find({ enviado: { $ne: true } }).toArray();
  }

  async marcarComoEnviado(ids: string[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection.updateMany(
      { _id: { $in: ids } },
      { $set: { enviado: true } },
    );
  }

  async updateFichajesValidados(fichajesValidados: FichajeValidadoDto) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesValidadosCollect =
      db.collection<FichajeValidadoDto>("fichajesValidados2");
    const id = fichajesValidados._id;
    delete fichajesValidados._id;
    const respFichajes = await fichajesValidadosCollect.updateOne(
      {
        _id: id,
      },
      {
        $set: fichajesValidados,
      },
    );
    return respFichajes;
  }
  async getFichajesPagar(idResponsable: number, aPagar: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesValidadosCollect =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesValidadosCollect
      .find({ idResponsable, aPagar })
      .toArray();
  }

  async getAllFichajesPagar(aPagar: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesValidadosCollect =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesValidadosCollect.find({ aPagar }).toArray();
  }

  async getAllIdResponsableFichajesPagar(idResponsable: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesIdResponsable =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesIdResponsable.find({ idResponsable }).toArray();
  }

  async getSemanasFichajesPagar(fechaInicio: DateTime, fechaFinal: DateTime) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesIdResponsable =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesIdResponsable
      .find({
        fichajeEntrada: {
          $gte: fechaInicio.toJSDate(),
          $lte: fechaFinal.toJSDate(),
        },
      })
      .toArray();
  }

  async getAllFichajesValidados(fecha: DateTime) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    const fechaInicio = fecha.startOf("day").toJSDate();
    const fechaFinal = fecha.plus({ days: 1 }).startOf("day").toJSDate();

    // Realizar la consulta
    const fichajes = await fichajesCollection
      .find({
        fichajeEntrada: {
          $gte: fechaInicio,
          $lt: fechaFinal,
        },
      })
      .toArray();
    return fichajes;
  }

  async getValidadosSemanaResponsable(
    fechaInicio: DateTime,
    fechaFinal: DateTime,
    idResponsable: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection
      .find({
        fichajeEntrada: {
          $gte: fechaInicio.toJSDate(),
          $lte: fechaFinal.toJSDate(),
        },
        idResponsable,
      })
      .toArray();
  }

  async getTiendaDia(tienda: number, dia: DateTime) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    const fechaInicio = dia.startOf("day").toJSDate();
    const fechaFinal = dia.plus({ days: 1 }).startOf("day").toJSDate();

    return await fichajesCollection
      .find({
        idTienda: tienda,
        fichajeEntrada: {
          $gte: fechaInicio,
          $lte: fechaFinal,
        },
      })
      .toArray();
  }

  async getParaCuadrante(
    fechaInicio: DateTime,
    fechaFinal: DateTime,
    idTrabajador: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection
      .find({
        fichajeEntrada: {
          $gte: fechaInicio.toJSDate(),
          $lte: fechaFinal.toJSDate(),
        },
        idTrabajador,
      })
      .toArray();
  }

  // Cuadrantes 2.0
  async getParaCuadranteNew(
    lunes: DateTime,
    domingo: DateTime,
    idTrabajador: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    const response = await fichajesCollection
      .find({
        idTrabajador,
        $and: [
          {
            fichajeEntrada: { $gte: lunes.toJSDate() },
            fichajeSalida: { $lte: domingo.toJSDate() },
          },
        ],
      })
      .toArray();
    return response;
  }

  async getFichajesValidadosTiendaRango(
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");
    return await fichajesCollection
      .find({
        idTienda: idTienda,
        $and: [
          { fichajeEntrada: { $gte: fechaInicio.toJSDate() } },
          { fichajeSalida: { $lte: fechaFinal.toJSDate() } },
        ],
      })
      .toArray();
  }

  async getFichajesValidadosTrabajadorTiendaRango(
    idTrabajador: number,
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    if (idTrabajador === 4963) {
      console.log("llegamos");
    }

    // Convertir fechas a UTC
    let fechaInicioUTC = fechaInicio.toUTC();
    let fechaFinalUTC = fechaFinal.toUTC();

    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const fichajesCollection =
      db.collection<FichajeValidadoDto>("fichajesValidados2");

    return await fichajesCollection
      .find({
        idTrabajador: idTrabajador,
        idTienda: idTienda,
        $and: [
          { fichajeEntrada: { $gte: fechaInicioUTC.toJSDate() } },
          { fichajeSalida: { $lte: fechaFinalUTC.toJSDate() } },
        ],
      })
      .toArray();
  }
}
