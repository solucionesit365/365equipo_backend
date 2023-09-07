import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class SolicitudVacacionesBdd {
  constructor(private readonly mongoDbService: MongoDbService) {}

  //Nueva solicitud de vacaciones
  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    solicitudVacaciones._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const resInsert = await solicitudVacacionesCollection.insertOne(
      solicitudVacaciones,
    );
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  async getSolicitudes() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({})
      .toArray();

    return respSolicitudes;
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ idBeneficiario })
      .toArray();

    return respSolicitudes;
  }

  //Borrar solicitud
  async borrarSolicitud(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    console.log(_id);

    const resDelete = await solicitudVacacionesCollection.deleteOne({
      _id: new ObjectId(_id),
    });
    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }
}
