import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { AusenciaInterface } from "../ausencias/ausencias.interface";
import { DateTime } from "luxon";

moment.locale("es", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});
// IMPORTANTE, FECHA INICIO PARA UNA SEMANA DEBE SER EL LUNES A LAS 00:00
// Y LA FECHA FINAL DOMINGO A LAS 23:59:59

@Injectable()
export class CuadrantesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  // Cuadrantes 2.0
  async insertCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resInsert = await cuadrantesCollection.insertOne(cuadrante);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  // Guardado nuevo (insert or update)
  async guardarCuadrantes(
    cuadrantesModificables: TCuadrante[],
    cuadrantesNuevos: TCuadrante[],
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

    // 1. Modificar los cuadrantes existentes
    for (const cuadrante of cuadrantesModificables) {
      const { _id, ...dataToUpdate } = cuadrante;

      await cuadrantesCollection.updateOne(
        { _id: _id },
        { $set: dataToUpdate },
      );
    }

    // 2. Insertar nuevos cuadrantes
    if (cuadrantesNuevos.length > 0) {
      await cuadrantesCollection.insertMany(cuadrantesNuevos);
    }
  }

  // Cuadrantes 2.0
  async insertCuadrantes(cuadrantes: TCuadrante[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resInsert = await cuadrantesCollection.insertMany(cuadrantes);
    if (resInsert.acknowledged && resInsert.insertedCount > 0) return true;
    return false;
  }

  // Cuadrantes 2.0
  async updateCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resInsert = await cuadrantesCollection.updateOne(
      { _id: cuadrante._id },
      {
        $set: {
          fechaInicio: cuadrante.inicio,
          fechaFinal: cuadrante.final,
          historialPlanes: cuadrante.historialPlanes,
          totalHoras: cuadrante.totalHoras,
          enviado: false,
        },
      },
    );
    return (
      resInsert.acknowledged &&
      (resInsert.modifiedCount > 0 || resInsert.upsertedCount > 0)
    );
  }

  // Cuadrantes 2.0
  async getCuadrantesIndividual(
    idTrabajador: number,
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

    const resCuadrantes = await cuadrantesCollection
      .find({
        idTrabajador,
        inicio: {
          $gte: fechaInicioBusqueda.toJSDate(),
        },
        final: {
          $lt: fechaFinalBusqueda.toJSDate(),
        },
      })
      .toArray();

    return resCuadrantes;
  }

  async borrarTurno(idTurno: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

    const resCuadrantes = await cuadrantesCollection.deleteOne({
      _id: new ObjectId(idTurno),
    });

    return resCuadrantes.acknowledged;
  }
  async borrarTurnoByPlan(idPlan: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

    const resCuadrantes = await cuadrantesCollection.deleteOne({
      idPlan: idPlan,
    });

    return resCuadrantes.acknowledged;
  }

  // Cuadrantes 2.0
  async setCuadranteEnviado(idCuadrante: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resEnviado = await cuadrantesCollection.updateOne(
      { _id: idCuadrante },
      {
        $set: {
          enviado: true,
        },
      },
    );

    return resEnviado.acknowledged;
  }

  // Cuadrantes 2.0
  async getCuadrantes(
    idTienda: number,
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection
      .find({
        idTienda: idTienda,
        inicio: {
          $gte: fechaInicioBusqueda.toJSDate(),
        },
        final: {
          $lte: fechaFinalBusqueda.toJSDate(),
        },
      })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  // Cuadrantes 2.0 (Falta filtro max. año)
  async getTodo() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection.find({}).toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  // Cuadrantes 2.0
  async getTiendas1Semana(
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection
      .find({
        fechaInicio: { $gte: fechaInicioBusqueda.toJSDate() },
        fechaFinal: { $lte: fechaFinalBusqueda.toJSDate() },
      })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  // Cuadrantes 2.0
  async getSemanas1Tienda(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection
      .find({ idTienda: idTienda })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  // Cuadrantes 2.0
  async getCuadrantesSubordinados(
    arrayIdsSubordinados: number[],
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection
      .find({
        idTrabajador: { $in: arrayIdsSubordinados },
        inicio: { $gte: fechaInicioBusqueda.toJSDate() },
        final: { $lte: fechaFinalBusqueda.toJSDate() },
      })
      .toArray();

    return resCuadrantes;
  }

  // Cuadrantes 2.0
  async getPendientesEnvio() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");
    const resCuadrantes = await cuadrantesCollection
      .find({ enviado: false })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  // Cuadrante 2.0
  public getMondayMoment(fecha: Date) {
    // Devuelve el lunes
    return DateTime.fromJSDate(fecha).startOf("week");
  }

  // // NO SE PUEDE TRADUCIR A CUADRANTES 2.0 DE FORMA FÁCIL
  // async cuadrantesPorAusencia(
  //   ausencia: AusenciaInterface,
  // ): Promise<TCuadrante[]> {
  //   const db = (await this.mongoDbService.getConexion()).db("soluciones");
  //   const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

  //   const cuadrantes = await cuadrantesCollection
  //     .find({
  //       idTrabajador: ausencia.idUsuario,
  //       $or: semanas.map(({ year, week }) => ({ year, semana: week })),
  //     })
  //     .toArray();

  //   return cuadrantes;
  // }

  // Cuadrantes 2.0 (Se utiliza solo como trigger de una nueva ausencia)
  async updateOrInsertManyCuadrantes(cuadrantes: TCuadrante[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes2");

    for (const cuadrante of cuadrantes) {
      const filtro = { _id: cuadrante._id };

      const documentoExistente = await cuadrantesCollection.findOne(filtro);

      if (documentoExistente) {
        delete cuadrante._id;
        await cuadrantesCollection.updateOne(filtro, { $set: cuadrante });
      } else {
        await cuadrantesCollection.insertOne(cuadrante);
      }
    }
  }

  async removeAusenciaFromCuadrantes(
    tipo: string,
    idUsuario: number,
    fechaInicio: Date,
    fechaFinal: Date,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const collection = db.collection("cuadrantes2");

    // Elimina los documentos (cuadrantes) que contienen una ausencia del tipo proporcionado, el idTrabajador especificado
    // y que se encuentran en el rango de fechas proporcionado
    const result = await collection.deleteMany({
      "ausencia.tipo": tipo,
      idTrabajador: idUsuario,
      inicio: { $gte: fechaInicio },
      final: { $lte: fechaFinal },
    });

    return result.deletedCount > 0;
  }

  async removeVacacionesFromCuadrantes(idUsuario, fechaInicio, fechaFinal) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const collection = db.collection("cuadrantes2");

    const result = await collection.deleteMany({
      "ausencia.tipo": "VACACIONES",
      idTrabajador: idUsuario,
      inicio: { $gte: fechaInicio },
      final: { $lte: fechaFinal },
    });

    console.log(result);

    // Si deletedCount es mayor que 0, entonces se borraron documentos, de lo contrario, no
    return result.deletedCount > 0;
  }
}
