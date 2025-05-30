import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import {
  SolicitudVacaciones,
  TSolicitudVacacionesDatabaseService,
} from "./solicitud-vacaciones.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class SolicitudVacacionesDatabaseService
  implements TSolicitudVacacionesDatabaseService
{
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva solicitud de vacaciones
  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    try {
      solicitudVacaciones._id = new ObjectId();
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const resInsert = await solicitudVacacionesCollection.insertOne(
        solicitudVacaciones,
      );
      if (resInsert.acknowledged) return resInsert.insertedId;
      throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al insertar la nueva solicitud de vacaciones",
      );
    }
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  async getSolicitudes(year: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const respSolicitudes = await solicitudVacacionesCollection
        .find({ year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de vacaciones",
      );
    }
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );

      const respSolicitudes = await solicitudVacacionesCollection
        .find({ idBeneficiario, year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de vacaciones del trabajador",
      );
    }
  }

  async getVacacionesByTiendas(tienda: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const respSolicitudes = await solicitudVacacionesCollection
        .find({ tienda })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de vacaciones por tienda",
      );
    }
  }

  async getsolicitudesSubordinados(idAppResponsable: string, year: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const respSolicitudes = await solicitudVacacionesCollection
        .find({ idAppResponsable, year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de vacaciones de los subordinados",
      );
    }
  }

  async getVacacionesByEstado(estado: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );
      const respSolicitudes = await solicitudVacacionesCollection
        .find({ estado })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de vacaciones por estado",
      );
    }
  }

  async getSolicitudesById(_id: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );

      const respSolicitudes = await solicitudVacacionesCollection.findOne({
        _id: new ObjectId(_id),
      });

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener la solicitud de vacaciones por ID",
      );
    }
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );

      const resDelete = await solicitudVacacionesCollection.deleteOne({
        _id: new ObjectId(_id),
      });
      return resDelete.acknowledged && resDelete.deletedCount > 0;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al borrar la solicitud de vacaciones",
      );
    }
  }

  //Actualizar estado de la solicitud de Vacaciones
  async updateSolicitudVacacionesEstado(
    solicitudesVacaciones: SolicitudVacaciones,
  ) {
    try {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al actualizar el estado de la solicitud de vacaciones",
      );
    }
  }

  async haySolicitudesParaBeneficiario(
    idBeneficiario: number,
  ): Promise<boolean> {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );

      const cuenta = await solicitudVacacionesCollection.countDocuments({
        idBeneficiario,
      });
      return cuenta > 0;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al verificar si hay solicitudes para el beneficiario",
      );
    }
  }

  async actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    try {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al actualizar el idAppResponsable para las solicitudes del beneficiario",
      );
    }
  }

  async setEnviado(vacaciones: SolicitudVacaciones) {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al marcar la solicitud de vacaciones como enviada",
      );
    }
  }

  async getSolicitudesParaEnviar() {
    try {
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
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes para enviar",
      );
    }
  }

  async getSolicitudesMultiplesTrabajadores(
    idsTrabajadores: number[],
    year: number,
  ) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudVacacionesCollection = db.collection<SolicitudVacaciones>(
        "solicitudVacaciones",
      );

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
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Error al obtener solicitudes de múltiples trabajadores",
      );
    }
  }
}
