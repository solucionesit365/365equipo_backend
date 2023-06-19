import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { nuevoCliente } from "./clientes.mssql";
import { SolicitudNuevoClienteBbdd } from "./clientes.mongodb";
import { SolicitudCliente } from "./clientes.interface";
import { ObjectId } from "mongodb";
import { EmailClass } from "../email/email.class";
import { CryptoClass } from "../crypto/crypto.class";
import { TarjetaCliente } from "../tarjeta-cliente/tarjeta-cliente.class";
import * as jwt from "jsonwebtoken";

@Injectable()
export class ClientesService {
  constructor(
    private readonly schSolicitudesCliente: SolicitudNuevoClienteBbdd,
    private readonly emailInstance: EmailClass,
    private readonly tarjetaClienteInstance: TarjetaCliente,
  ) {}
  async handleForm(
    nuevoCliente: boolean,
    newsletter: boolean,
    email: string,
    nombre?: string,
    apellidos?: string,
    telefono?: string,
    codigoPostal?: string,
  ) {
    console.log(nuevoCliente);

    if (nuevoCliente) {
      const solicitud: SolicitudCliente = {
        _id: new ObjectId().toString(),
        email: email,
        fechaRegistro: new Date(),
        nombre,
        apellidos,
        telefono,
        newsletter,
        codigoPostal,
      };
      await this.schSolicitudesCliente.nuevaSolicitud(solicitud);
      const emailBody = `
      <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .email-container {
                    width: 80%;
                    margin: 0 auto;
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                    text-align: center;
                }
                .email-content {
                    margin-top: 20px;
                }
                .confirmation-button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    font-size: 16px;
                    margin: 20px 2px;
                    cursor: pointer;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <img src="https://365equipo.com/logo365Email.png" alt="365 Obrador Logo">
                </div>
                <div class="email-content">
                    <p>Ja gairebé ets part del #club365🎉 Fes clic a l'enllaç per a confirmar el teu registre.</p>
                    <a href="https://365equipo.cloud/clientes/confirmarEmail?idSolicitud=${solicitud._id}" class="confirmation-button">Confirmar correu electrònic</a>
                </div>
            </div>
        </body>
        </html>

      `;
      // URL para el template https://365equipo.com/clientes/confirmarEmail?idSolicitud=${solicitud._id}
      await this.emailInstance.enviarEmail(
        solicitud.email,
        emailBody,
        "Confirmació de registre el 365",
      );
      return true;
    } else {
      await this.tarjetaClienteInstance.sendQRInvitation(
        `QR_INVITACION_${email}`,
        email,
      );
    }
  }

  async crearCliente(
    nombre: string,
    apellidos: string,
    telefono: string,
    codigoPostal: string,
    toEmail: string,
  ) {
    const uniqueId = uuidv4();
    const idCliente = "CliBoti_APP_" + uniqueId;
    let idExterna = "QRCLIENT" + uuidv4();
    idExterna = idExterna.replace(/-/g, "");

    await nuevoCliente(
      nombre,
      apellidos,
      telefono,
      idCliente,
      codigoPostal,
      idExterna,
      toEmail,
    );
    await this.generarStringIdentificacion(idExterna, toEmail);
    return idExterna;
  }

  async generarStringIdentificacion(idExterna: string, toEmail: string) {
    // const codigoString = this.cryptoInstance.cifrarParaHit(idCliente);
    await this.tarjetaClienteInstance.sendQrCodeEmail(idExterna, toEmail);
  }

  async confirmarEmail(idSolicitud: SolicitudCliente["_id"]) {
    const solicitud = await this.schSolicitudesCliente.getSolicitud(
      idSolicitud,
    );

    if (!solicitud) throw Error("No existe esta solicitud o ha caducado");

    const idExterna = await this.crearCliente(
      solicitud.nombre,
      solicitud.apellidos,
      solicitud.telefono,
      solicitud.codigoPostal,
      solicitud.email,
    );

    if (idExterna) {
      if (await this.schSolicitudesCliente.borrarSolicitud(solicitud._id))
        return this.createPassObject(idExterna);
    }
    throw Error("No se ha podido registrar el cliente");
  }

  async createPassObject(idTarjetaCliente: string) {
    // TODO: Create a new Generic pass for the user
    const issuerId = "3388000000022232953";
    const classId = `${issuerId}.tarjetas-cliente`;
    const credentials = require(process.env.API_EZE_CREDENTIALS);

    let objectId = `${issuerId}.${idTarjetaCliente}`;

    const nombreCliente = "Ezequiel Carissimo Oms";

    let genericObject = {
      id: `${objectId}`,
      classId: classId,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#4285f4",
      logo: {
        sourceUri: {
          uri: "https://365equipo.com/favicon.png",
        },
      },
      cardTitle: {
        defaultValue: {
          language: "ca",
          value: "365 Obrador",
        },
      },
      subheader: {
        defaultValue: {
          language: "ca",
          value: "Nom client",
        },
      },
      header: {
        defaultValue: {
          language: "ca",
          value: nombreCliente,
        },
      },
      barcode: {
        type: "QR_CODE",
        value: `${objectId}`,
      },
      heroImage: {
        sourceUri: {
          uri: "https://365equipo.com/logoQrWallet.jpg",
        },
      },
    };

    // TODO: Create the signed JWT and link
    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins: [],
      typ: "savetowallet",
      payload: {
        genericObjects: [genericObject],
      },
    };

    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: "RS256",
    });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return saveUrl;
  }
}
