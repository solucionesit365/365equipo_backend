import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { diaPersonal } from "../dia-personal/dia-personal.interface";
import { MongoService } from "../mongo/mongo.service";
import { DateTime } from "luxon";

@Injectable()
export class diaPersonalMongo {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva solicitud de dia personal
  async nuevaSolicitudDiaPersonal(diaPersonal: diaPersonal) {
    diaPersonal._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");
    const resInsert = await solicitudDiaPersonalCollection.insertOne(
      diaPersonal,
    );
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nueva solicitud de dia Personal");
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  async getSolicitudes(year: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");
    const respSolicitudes = await solicitudDiaPersonalCollection
      .find({ year })
      .toArray();

    return respSolicitudes;
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");
    const startDate = DateTime.local(year, 1, 1).toFormat("dd/MM/yyyy");
    const endDate = DateTime.local(year + 1, 1, 1).toFormat("dd/MM/yyyy");

    const respSolicitudes = await solicitudDiaPersonalCollection
      .find({ idBeneficiario, year })
      .toArray();

    return respSolicitudes;
  }

  async getSolicitudesById(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");

    const respSolicitudes = await solicitudDiaPersonalCollection.findOne({
      _id: new ObjectId(_id),
    });

    return respSolicitudes;
  }

  async solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");
    const respSolicitudes = await solicitudDiaPersonalCollection
      .find({ idAppResponsable, year })
      .toArray();

    return respSolicitudes;
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");

    const resDelete = await solicitudDiaPersonalCollection.deleteOne({
      _id: new ObjectId(_id),
    });
    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  //Actualizar estado de la solicitud de Vacaciones
  async updateSolicitudDiaPersonalEstado(diaPersonal: diaPersonal) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");

    const respSolicitudes = await solicitudDiaPersonalCollection.updateOne(
      {
        _id: new ObjectId(diaPersonal._id),
      },
      {
        $set: {
          estado: diaPersonal.estado,
          respuestaSolicitud: diaPersonal.respuestaSolicitud,
        },
      },
    );

    if (respSolicitudes.acknowledged && respSolicitudes.modifiedCount > 0)
      return true;
    throw Error("No se ha podido modificar el estado");
  }

  async haySolicitudesParaBeneficiario(
    idBeneficiario: number,
  ): Promise<boolean> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");

    const cuenta = await solicitudDiaPersonalCollection.countDocuments({
      idBeneficiario,
    });
    return cuenta > 0;
  }

  async actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudDiaPersonalCollection =
      db.collection<diaPersonal>("diaPersonal");

    const resultado = await solicitudDiaPersonalCollection.updateMany(
      { idBeneficiario },
      { $set: { idAppResponsable } },
    );

    if (resultado.acknowledged) {
      return true;
    } else {
      throw new Error(
        "No se pudo actualizar el idAppResponsable para las solicitudes del beneficiario",
      );
    }
  }
}
