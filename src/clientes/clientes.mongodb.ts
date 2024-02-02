import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { SolicitudCliente } from "./clientes.interface";

@Injectable()
export class SolicitudNuevoClienteBbdd {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaSolicitud(solicitud: SolicitudCliente) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );
    const resInsert = await solicitudesClienteCollection.insertOne(solicitud);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error(
      "No se ha podido insertar la solicitud de registro del nuevo cliente",
    );
  }

  async getSolicitud(idSolicitud: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );

    return await solicitudesClienteCollection.findOne({ _id: idSolicitud });
  }

  async borrarSolicitud(idSolicitud: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );

    const resDelete = await solicitudesClienteCollection.deleteOne({
      _id: idSolicitud,
    });

    return resDelete.acknowledged;
  }
}
