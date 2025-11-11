import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class SolicitudVacacionesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva solicitud de vacaciones
  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    solicitudVacaciones._id = new ObjectId();
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const resInsert =
      await solicitudVacacionesCollection.insertOne(solicitudVacaciones);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  async getSolicitudes(year: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ year })
      .toArray();

    return respSolicitudes;
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    // const startDate = DateTime.local(year, 1, 1).toFormat("dd/MM/yyyy");
    // const endDate = DateTime.local(year + 1, 1, 1).toFormat("dd/MM/yyyy");

    const respSolicitudes = await solicitudVacacionesCollection
      .find({ idBeneficiario, year })
      .toArray();

    return respSolicitudes;
  }

  async getVacacionesByTiendas(tienda: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ tienda })
      .toArray();

    return respSolicitudes;
  }

  async getsolicitudesSubordinados(idAppResponsable: string, year: number) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    // Busca por idAppResponsable O idAppResponsableB para capturar ambas coordinadoras
    const respSolicitudes = await solicitudVacacionesCollection
      .find({
        $or: [{ idAppResponsable }, { idAppResponsableB: idAppResponsable }],
        year,
      })
      .toArray();

    return respSolicitudes;
  }

  async getVacacionesByEstado(estado: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );
    const respSolicitudes = await solicitudVacacionesCollection
      .find({ estado })
      .toArray();

    return respSolicitudes;
  }

  async getSolicitudesById(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const respSolicitudes = await solicitudVacacionesCollection.updateOne(
      {
        _id: new ObjectId(solicitudesVacaciones._id),
      },
      {
        $set: {
          estado: solicitudesVacaciones.estado,
          respuestaSolicitud: solicitudesVacaciones.respuestaSolicitud,
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
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const cuenta = await solicitudVacacionesCollection.countDocuments({
      idBeneficiario,
    });
    return cuenta > 0;
  }

  async actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
      "solicitudVacaciones",
    );

    const resultado = await solicitudVacacionesCollection.updateMany(
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

  async setEnviado(vacaciones: SolicitudVacaciones) {
    console.log(vacaciones);

    try {
      const db = (await this.mongoDbService.getConexion()).db();
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
    const db = (await this.mongoDbService.getConexion()).db();
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

  async getSolicitudesMultiplesTrabajadores(
    idsTrabajadores: number[],
    year: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudVacacionesCollection = db.collection("solicitudVacaciones");

    // 🔹 Asegurar que los IDs están en formato correcto
    if (!Array.isArray(idsTrabajadores) || idsTrabajadores.length === 0) {
      console.warn("⚠️ No hay IDs de trabajadores para buscar solicitudes.");
      return [];
    }

    // 🔹 Hacer la consulta correctamente con `$in`
    const respSolicitudes = await solicitudVacacionesCollection
      .find({
        idBeneficiario: { $in: idsTrabajadores }, // Filtrar por IDs de beneficiarios
        year: year, // Filtrar por año
      })
      .toArray();

    return respSolicitudes;
  }
}
