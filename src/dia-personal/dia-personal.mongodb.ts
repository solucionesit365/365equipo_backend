import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ObjectId } from "mongodb";
import {
  DiaPersonal,
  TDiaPersonalDatabaseService,
} from "../dia-personal/dia-personal.interface";
import { MongoService } from "../mongo/mongo.service";

@Injectable()
export class DiaPersonalDatabaseService implements TDiaPersonalDatabaseService {
  constructor(private readonly mongoDbService: MongoService) {}

  //Nueva solicitud de dia personal
  async nuevaSolicitudDiaPersonal(diaPersonal: DiaPersonal) {
    try {
      diaPersonal._id = new ObjectId();
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");
      const resInsert = await solicitudDiaPersonalCollection.insertOne(
        diaPersonal,
      );
      if (resInsert.acknowledged) return resInsert.insertedId;
      throw Error(
        "No se ha podido insertar la nueva solicitud de dia Personal",
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al procesar la solicitud de día personal",
      );
    }
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  async getSolicitudes(year: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");
      const respSolicitudes = await solicitudDiaPersonalCollection
        .find({ year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de día personal",
      );
    }
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");
      // const startDate = DateTime.local(year, 1, 1).toFormat("dd/MM/yyyy");
      // const endDate = DateTime.local(year + 1, 1, 1).toFormat("dd/MM/yyyy");

      const respSolicitudes = await solicitudDiaPersonalCollection
        .find({ idBeneficiario, year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de día personal del trabajador",
      );
    }
  }

  async getSolicitudesById(_id: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");

      const respSolicitudes = await solicitudDiaPersonalCollection.findOne({
        _id: new ObjectId(_id),
      });

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener la solicitud de día personal por ID",
      );
    }
  }

  async solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");
      const respSolicitudes = await solicitudDiaPersonalCollection
        .find({ idAppResponsable, year })
        .toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las solicitudes de día personal de los subordinados",
      );
    }
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");

      const resDelete = await solicitudDiaPersonalCollection.deleteOne({
        _id: new ObjectId(_id),
      });
      return resDelete.acknowledged && resDelete.deletedCount > 0;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al procesar la solicitud de eliminación de día personal",
      );
    }
  }

  //Actualizar estado de la solicitud de Vacaciones
  async updateSolicitudDiaPersonalEstado(diaPersonal: DiaPersonal) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");

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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al actualizar el estado de la solicitud de día personal",
      );
    }
  }

  async haySolicitudesParaBeneficiarioDiaPersonal(
    idBeneficiario: number,
  ): Promise<boolean> {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");

      const cuenta = await solicitudDiaPersonalCollection.countDocuments({
        idBeneficiario,
      });

      return cuenta > 0;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al verificar las solicitudes de día personal para el beneficiario",
      );
    }
  }

  async actualizarIdAppResponsableDiaPersonal(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const solicitudDiaPersonalCollection =
        db.collection<DiaPersonal>("diaPersonal");

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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al actualizar el idAppResponsable de las solicitudes de día personal",
      );
    }
  }
}
