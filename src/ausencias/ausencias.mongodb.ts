import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { AusenciaInterface } from "./ausencias.interface";
import { ObjectId } from "mongodb";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
import { DateTime } from "luxon";

@Injectable()
export class AusenciasDatabase {
  constructor(
    private readonly mongoDbService: MongoService,
    private readonly hitMssqlService: HitMssqlService,
  ) {}

  async nuevaAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resInsert = await ausenciasCollection.insertOne(ausencia);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva ausencia");
  }

  async deleteAusencia(idAusencia: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resDelete = await ausenciasCollection.deleteOne({
      _id: new ObjectId(idAusencia),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  async updateAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resUpdate = await ausenciasCollection.updateOne(
      {
        _id: new ObjectId(ausencia._id),
      },
      {
        $set: {
          fechaInicio: ausencia.fechaInicio,
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
        },
      },
    );

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resUpdate = await ausenciasCollection.updateOne(
      {
        _id: new ObjectId(ausencia._id),
      },
      {
        $set: {
          fechaInicio: ausencia.fechaInicio,
          fechaFinal: ausencia.fechaFinal,
          fechaRevision: ausencia.fechaRevision ? ausencia.fechaRevision : null,
          tipo: ausencia.tipo,
          comentario: ausencia.comentario,
          completa: ausencia.completa,
          horas: ausencia.horas,
        },
      },
    );

    if (resUpdate.acknowledged && resUpdate.matchedCount > 0) return true;
    throw Error("No se ha podido modificar la ausencia");
  }

  async getAusencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.find({}).toArray();

    return respAusencia;
  }

  async getAusenciasById(idAusencia: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    return await ausenciasCollection.findOne({ _id: idAusencia });
  }

  async getAusenciasSincro() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection
      .find({ enviado: { $ne: true } })
      .toArray();

    return respAusencia;
  }

  async marcarComoEnviada(id: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.updateOne(
      { _id: id },
      {
        $set: {
          enviado: true,
        },
      },
    );

    return respAusencia.acknowledged;
  }

  async sincroAusenciasHit() {
    const ausenciasPendientes = await this.getAusenciasSincro();

    // param0 = diaAusencia
    // param1 = idEmpleado
    // param2 = ${tipoAusencia}[Horas:${horas}]

    for (let i = 0; i < ausenciasPendientes.length; i += 1) {
      let fechaInicial = DateTime.fromJSDate(
        ausenciasPendientes[i].fechaInicio,
      ); //moment(ausenciasPendientes[i].fechaInicio);
      const fechaFinal = DateTime.fromJSDate(ausenciasPendientes[i].fechaFinal); //moment(ausenciasPendientes[i].fechaFinal);

      while (fechaInicial <= fechaFinal) {
        let sql = "";
        const nombreTabla = `cdpCalendariLaboral_${fechaInicial.year}`;
        sql += `
            INSERT INTO ${nombreTabla} (id, fecha, idEmpleado, estado, observaciones, TimeStamp, usuarioModif)
            VALUES (
              NEWID(),
              CONVERT(datetime, @param0, 103),
              @param1,
              'JUSTIFICADAS',
              @param2,
              getdate(),
              '365Equipo'
            )
      `;
        let observaciones = "";
        // const esParcial = this.esParcial(
        //   ausenciasPendientes[i].arrayParciales,
        //   fechaInicial.toDate(),
        // );

        // Tratamiento diferente para las parciales
        if (
          !ausenciasPendientes[i].completa &&
          ausenciasPendientes[i].horas > 0
        ) {
          observaciones =
            ausenciasPendientes[i].tipo +
            `[Horas:${ausenciasPendientes[i].horas}]`;
        } else {
          observaciones = ausenciasPendientes[i].tipo + `[Horas:8]`;
        }

        await this.hitMssqlService.recHitBind(
          sql,
          fechaInicial.toFormat("dd/MM/yyyy"),
          ausenciasPendientes[i].idUsuario,
          observaciones,
        );

        fechaInicial = fechaInicial.plus({ days: 1 });
      }
      if (!this.marcarComoEnviada(ausenciasPendientes[i]._id))
        throw Error("No se ha podido guardar el estado enviado de la ausencia");
    }
  }
}
