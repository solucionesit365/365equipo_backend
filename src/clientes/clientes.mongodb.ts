import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { SolicitudCliente } from "./clientes.interface";
import { CodigoFlayers } from "./clientes.interface";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class SolicitudNuevoClienteBbdd {
  constructor(
    private readonly mongoDbService: MongoService,
    private readonly hitMssqlService: HitMssqlService,
  ) {}

  //Guardar los datos del cliente que ha solicitado un flayer por QR
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

  //Guardar cupon de un solo uso
  async nuevoCodigoFlayer(flayer: CodigoFlayers) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection =
      db.collection<CodigoFlayers>("codigosFlayers");
    const resInsert = await solicitudesClienteCollection.insertOne(flayer);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido guardar el codigo del flayer");
  }

  async getSolicitud(idSolicitud: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection = db.collection<SolicitudCliente>(
      "solicitudRegistroCliente",
    );

    return await solicitudesClienteCollection.findOne({ _id: idSolicitud });
  }

  async getAllFlayers() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const solicitudesClienteCollection =
      db.collection<SolicitudCliente>("codigosFlayers");

    return await solicitudesClienteCollection.find().toArray();
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

  async nuevoCliente(
    nombre: string,
    apellidos: string,
    telefono: string,
    id: string,
    codigoPostal: string,
    idExterna: string,
    email: string,
  ) {
    // @param0 = id
    // @param1 = nombre + apellidos
    // @param2 = telefono
    // @param3 = codigoPostal
    // @param4 = idExterna
    // @param5 = email
    const sql = `
    IF EXISTS (SELECT * FROM ClientsFinals WHERE Id = @param0 OR emili = @param5) 
      BEGIN
        SELECT 'YA_EXISTE' as resultado
      END
    ELSE
      BEGIN
        INSERT INTO ClientsFinals VALUES (@param0, @param1, @param2, '', @param5, '', @param3, '', @param4);
        INSERT INTO Punts (IdClient, Punts, data, Punts2, data2) VALUES (@param0, 2500, GETDATE(), NULL, NULL);
        SELECT 'CREADO' as resultado;
      END
    `;

    await this.hitMssqlService.recHitBind(
      sql,
      id,
      nombre + " " + apellidos,
      telefono,
      codigoPostal,
      idExterna,
      email,
    );
  }
}
