import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { nuevoCliente } from "./clientes.mssql";
import { SolicitudNuevoClienteBbdd } from "./clientes.mongodb";
import { SolicitudCliente } from "./clientes.interface";
import { ObjectId } from "mongodb";
import { EmailClass } from "../email/email.class";
import { CryptoClass } from "../crypto/crypto.class";
import { TarjetaCliente } from "../tarjeta-cliente/tarjeta-cliente.class";

@Injectable()
export class ClientesService {
  constructor(
    private readonly schSolicitudesCliente: SolicitudNuevoClienteBbdd,
    private readonly cryptoInstance: CryptoClass,
    private readonly emailInstance: EmailClass,
    private readonly tarjetaClienteInstance: TarjetaCliente,
  ) { }
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
                    <img src="https://365obrador.com/wp-content/uploads/2022/06/logo-365.png" alt="365 Obrador Logo">
                    <h1>Bienvenid@ a 365</h1>
                </div>
                <div class="email-content">
                    <p>Gracias por registrarte en 365. Haz clic en el enlace de abajo para confirmar tu dirección de correo electrónico y completar tu registro.</p>
                    <a href="https://365equipo.cloud/clientes/confirmarEmail?idSolicitud=${solicitud._id}" class="confirmation-button">Confirmar correo electrónico</a>
                </div>
            </div>
        </body>
        </html>

      `;
      // URL para el template https://365equipo.com/clientes/confirmarEmail?idSolicitud=${solicitud._id}
      await this.emailInstance.enviarEmail(
        solicitud.email,
        emailBody,
        "Confirmación de registro en 365",
      );
      return true;
    } else {
      console.log("No quiero ser cliente p");
      await this.tarjetaClienteInstance.sendQRInvitation(`QR_INVITACION_${email}`, email)
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
    const idExterna = "QR_CLIENT_" + uuidv4();

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
    return true;
  }

  async generarStringIdentificacion(idExterna: string, toEmail: string) {
    // const codigoString = this.cryptoInstance.cifrarParaHit(idCliente);
    await this.tarjetaClienteInstance.sendQrCodeEmail(idExterna, toEmail);
  }

  async confirmarEmail(idSolicitud: SolicitudCliente["_id"]) {
    const solicitud = await this.schSolicitudesCliente.getSolicitud(
      idSolicitud,
    );

    console.log(solicitud);


    if (!solicitud) throw Error("No existe esta solicitud o ha caducado");

    if (
      await this.crearCliente(
        solicitud.nombre,
        solicitud.apellidos,
        solicitud.telefono,
        solicitud.codigoPostal,
        solicitud.email,
      )
    ) {
      if (await this.schSolicitudesCliente.borrarSolicitud(solicitud._id))
        return true;
    }
    throw Error("No se ha podido registrar el cliente");
  }
}
