import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { SolicitudCliente } from "./clientes.interface";
import { CodigoFlayers } from "./clientes.interface";
// import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class SolicitudNuevoClienteBbdd {
  constructor(private readonly mongoDbService: MongoService) {}

  //Guardar los datos del cliente que ha solicitado un flayer por QR
  async nuevaSolicitud(solicitud: SolicitudCliente) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );
    const solicitudExistente = await solicitudesClienteCollection.findOne({
      email: solicitud.email,
    });
    if (solicitudExistente) {
      throw new Error(
        "Este correo ya ha sido utilizado para registrar una solicitud.",
      );
    }
    const resInsert = await solicitudesClienteCollection.insertOne(solicitud);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error(
      "No se ha podido insertar la solicitud de registro del nuevo cliente",
    );
  }

  //Guardar cupon de un solo uso
  async nuevoCodigoFlayer(flayer: CodigoFlayers) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection =
      db.collection<CodigoFlayers>("codigosFlayers");

    const solicitudExistente = await solicitudesClienteCollection.findOne({
      email: flayer.email,
    });
    if (solicitudExistente) {
      throw new Error(
        "Este correo ya ha sido utilizado para tener un codigo de flayer",
      );
    }
    const resInsert = await solicitudesClienteCollection.insertOne(flayer);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido guardar el codigo del flayer");
  }

  async getSolicitud(idSolicitud: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );

    return await solicitudesClienteCollection.findOne({ _id: idSolicitud });
  }

  async getAllFlayers() {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection =
      db.collection<CodigoFlayers>("codigosFlayers");

    return await solicitudesClienteCollection.find().toArray();
  }

  async borrarSolicitud(idSolicitud: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );

    const resDelete = await solicitudesClienteCollection.deleteOne({
      _id: idSolicitud,
    });

    return resDelete.acknowledged;
  }

  async validarFlayer(codigo: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection =
      db.collection<CodigoFlayers>("codigosFlayers");

    return await solicitudesClienteCollection.findOne({ codigo: codigo });
  }
  async caducarFlayer(codigo: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const solicitudesClienteCollection =
      db.collection<CodigoFlayers>("codigosFlayers");

    return await solicitudesClienteCollection.updateOne(
      {
        codigo: codigo,
      },
      {
        $set: {
          caducado: true,
        },
      },
    );
  }
}
