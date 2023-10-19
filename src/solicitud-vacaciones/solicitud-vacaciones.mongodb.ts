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

  async getVacacionesByTiendas(tienda: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ tienda })
      .toArray();

    return respSolicitudes;
  }

  async getsolicitudesSubordinados(idAppResponsable: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ idAppResponsable })
      .toArray();

    return respSolicitudes;
  }

  async getVacacionesByEstado(estado: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ estado })
      .toArray();

    return respSolicitudes;
  }

  async getSolicitudesById(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const respSolicitudes = await solicitudVacacionesCollection.findOne({
      _id: new ObjectId(_id),
    });

    return respSolicitudes;
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const resDelete = await solicitudVacacionesCollection.deleteOne({
      _id: new ObjectId(_id),
    });
    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  //Actualizar estado de la solicitud de Vacaciones
  async updateSolicitudVacacionesEstado(
    solicitudesVacaciones: SolicitudVacaciones,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const respSolicitudes = await solicitudVacacionesCollection.updateOne(
      {
        _id: new ObjectId(solicitudesVacaciones._id),
      },
      {
        $set: {
          enviado: true,
          estado: solicitudesVacaciones.estado,
          respuestaSolicitud: solicitudesVacaciones.respuestaSolicitud,
        },
      },
    );

    if (respSolicitudes.acknowledged && respSolicitudes.modifiedCount > 0)
      return true;
    throw Error("No se ha podido modificar el estado");
  }

  async setEnviado(vacaciones: SolicitudVacaciones) {
    try {
      const db = (await this.mongoDbService.getConexion()).db("soluciones");
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const respSolicitudes = await solicitudVacacionesCollection.updateOne(
        {
          _id: vacaciones._id,
        },
        {
          $set: {
            enviado: true,
          },
        },
      );
      if (respSolicitudes.acknowledged && respSolicitudes.modifiedCount > 0)
        return true;
      throw Error("No se ha podido modificar el estado");
    } catch (error) {}
  }

  async getSolicitudesParaEnviar(): Promise<
    {
      idBeneficiario: number;
      nombreApellidos: string;
      fechaInicio: string;
      fechaFinal: string;
      fechaIncorporacion: string;
      fechaCreacion: string;
      totalDias: number;
      tienda: string;
      respuestaSolicitud: string;
      observaciones: string;
      estado: string;
      creador: number;
      creadasPor?: string;
      idSolicitud: number;
      enviado: boolean;
      idAppResponsable: string;
    }[]
  > {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const respSolicitudes = await solicitudVacacionesCollection
      .find({
        estado: "APROBADA",
        enviado: false,
      })
      .toArray();

    if (respSolicitudes.length > 0) {
      return respSolicitudes;
    } else return [];
  }
}
