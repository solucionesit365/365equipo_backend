import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { SolicitudNuevoClienteBbdd } from "./clientes.mongodb";
import { SolicitudCliente } from "./clientes.interface";
import { ObjectId } from "mongodb";
import { EmailService } from "../email/email.class";
import { TarjetaClienteService } from "../tarjeta-cliente/tarjeta-cliente.class";
import { MailchimpService } from "../mailchimp/mailchimp.service";
import * as jwt from "jsonwebtoken";
import { GoogleAuth } from "google-auth-library";

@Injectable()
export class ClientesService {
  constructor(
    private readonly schSolicitudesCliente: SolicitudNuevoClienteBbdd,
    private readonly emailInstance: EmailService,
    private readonly tarjetaClienteInstance: TarjetaClienteService,
    private readonly mailchimpService: MailchimpService,
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
    if (nuevoCliente) {
      return await this.handleNuevoCliente(
        email,
        newsletter,
        nombre,
        apellidos,
        telefono,
        codigoPostal,
      );
    }

    await this.handleFlayerInvitation(
      email,
      newsletter,
      nombre,
      apellidos,
      telefono,
      codigoPostal,
    );
  }

  private async handleNuevoCliente(
    email: string,
    newsletter: boolean,
    nombre?: string,
    apellidos?: string,
    telefono?: string,
    codigoPostal?: string,
  ) {
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

    const emailBody = this.buildConfirmationEmailBody(solicitud._id);
    await this.emailInstance.enviarEmail(
      solicitud.email,
      emailBody,
      "Confirmació de registre el 365",
    );

    await this.handleMailchimpSubscription(
      email,
      newsletter,
      ["Nuevo Cliente", "Club 365"],
      nombre,
      apellidos,
      telefono,
      codigoPostal,
    );

    return true;
  }

  private async handleFlayerInvitation(
    email: string,
    newsletter: boolean,
    nombre?: string,
    apellidos?: string,
    telefono?: string,
    codigoPostal?: string,
  ) {
    const solicitud: SolicitudCliente = {
      _id: new ObjectId().toString(),
      email: email,
      fechaRegistro: new Date(),
      newsletter,
    };
    await this.schSolicitudesCliente.nuevaSolicitud(solicitud);

    const codFlayer = `QR_INVITACION_${uuidv4()}`;
    const data = {
      _id: new ObjectId().toString(),
      email: email,
      fechaRegistro: new Date(),
      caducado: false,
      codigo: codFlayer,
      newsletter: true,
    };
    await this.schSolicitudesCliente.nuevoCodigoFlayer(data);
    await this.tarjetaClienteInstance.sendQRInvitation(codFlayer, email);

    await this.handleMailchimpSubscription(
      email,
      newsletter,
      ["Newsletter", "Flayer Digital"],
      nombre,
      apellidos,
      telefono,
      codigoPostal,
    );
  }

  private async handleMailchimpSubscription(
    email: string,
    newsletter: boolean,
    tags: string[],
    nombre?: string,
    apellidos?: string,
    telefono?: string,
    codigoPostal?: string,
  ) {
    if (!newsletter) {
      console.log(
        `ℹ️  User ${email} did not accept newsletter, not subscribing to Mailchimp`,
      );
      return;
    }

    const result = await this.mailchimpService.subscribeContact(
      email,
      nombre,
      apellidos,
      telefono,
      codigoPostal,
      tags,
    );

    if (result.success) {
      console.log(`✅ Contact ${email} successfully subscribed to Mailchimp`);
    } else {
      console.error(
        `❌ Error subscribing ${email} to Mailchimp: ${result.error}`,
      );
    }
  }

  private buildConfirmationEmailBody(solicitudId: string): string {
    return `
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
                    <a href="https://365equipo.cloud/clientes/confirmarEmail?idSolicitud=${solicitudId}" class="confirmation-button">Confirmar correu electrònic</a>
                </div>
            </div>
        </body>
        </html>
    `;
  }

  // async crearCliente(
  //   nombre: string,
  //   apellidos: string,
  //   telefono: string,
  //   codigoPostal: string,
  //   toEmail: string,
  // ) {
  //   const uniqueId = uuidv4();
  //   const idCliente = "CliBoti_APP_" + uniqueId;
  //   let idExterna = "QRCLIENT" + uuidv4();
  //   idExterna = idExterna.replace(/-/g, "");

  //   await this.nuevoCliente(
  //     nombre,
  //     apellidos,
  //     telefono,
  //     idCliente,
  //     codigoPostal,
  //     idExterna,
  //     toEmail,
  //   );

  //   return idExterna;
  // }

  async enviarStringIdentificacion(
    idExterna: string,
    toEmail: string,
    walletUrl: string,
  ) {
    await this.tarjetaClienteInstance.sendQrCodeEmail(
      idExterna,
      toEmail,
      walletUrl,
    );
  }

  // async confirmarEmail(
  //   idSolicitud: SolicitudCliente["_id"],
  //   issuerId: string,
  //   classId: string,
  // ) {
  //   const solicitud = await this.schSolicitudesCliente.getSolicitud(
  //     idSolicitud,
  //   );

  //   if (!solicitud) throw Error("No existe esta solicitud o ha caducado");

  //   const idExterna = await this.crearCliente(
  //     solicitud.nombre,
  //     solicitud.apellidos,
  //     solicitud.telefono,
  //     solicitud.codigoPostal,
  //     solicitud.email,
  //   );
  //   const walletUrl = await this.createPassObject(
  //     idExterna,
  //     solicitud.nombre,
  //     issuerId,
  //     classId,
  //   );

  //   await this.enviarStringIdentificacion(
  //     idExterna,
  //     solicitud.email,
  //     walletUrl,
  //   );

  //   if (idExterna) {
  //     if (await this.schSolicitudesCliente.borrarSolicitud(solicitud._id))
  //       return walletUrl;
  //   }
  //   throw Error("No se ha podido registrar el cliente");
  // }

  async createPassObject(
    idTarjetaCliente: string,
    nombre: string,
    issuerId: string,
    classId: string,
  ) {
    // TODO: Create a new Generic pass for the user

    const objectId = `${issuerId}.${idTarjetaCliente}`;

    const credentials =
      process.env.ENTORNO === "test"
        ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : JSON.parse(process.env.WALLET_ACCOUNT);

    const genericObject = {
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
          value: nombre,
        },
      },
      barcode: {
        type: "QR_CODE",
        value: `${objectId}`,
      },
      heroImage: {
        sourceUri: {
          uri: "https://365equipo.com/logoQrWallet.png",
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

  async createPassClass(classId: string) {
    const credentials =
      process.env.ENTORNO === "test"
        ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : JSON.parse(process.env.WALLET_ACCOUNT);

    const httpClient = new GoogleAuth({
      credentials: credentials,
      scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
    });

    const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";

    const genericClass = {
      id: `${classId}`,
      // classTemplateInfo: {
      //   cardTemplateOverride: {
      //     cardRowTemplateInfos: [
      //       {
      //         twoItems: {
      //           startItem: {
      //             firstValue: {
      //               fields: [
      //                 {
      //                   fieldPath: 'object.textModulesData["points"]',
      //                 },
      //               ],
      //             },
      //           },
      //           endItem: {
      //             firstValue: {
      //               fields: [
      //                 {
      //                   fieldPath: 'object.textModulesData["contacts"]',
      //                 },
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     ],
      //   },
      //   // detailsTemplateOverride: {
      //   //   detailsItemInfos: [
      //   //     {
      //   //       item: {
      //   //         firstValue: {
      //   //           fields: [
      //   //             {
      //   //               fieldPath: 'class.imageModulesData["event_banner"]',
      //   //             },
      //   //           ],
      //   //         },
      //   //       },
      //   //     },
      //   //     {
      //   //       item: {
      //   //         firstValue: {
      //   //           fields: [
      //   //             {
      //   //               fieldPath: 'class.textModulesData["game_overview"]',
      //   //             },
      //   //           ],
      //   //         },
      //   //       },
      //   //     },
      //   //     {
      //   //       item: {
      //   //         firstValue: {
      //   //           fields: [
      //   //             {
      //   //               fieldPath: 'class.linksModuleData.uris["official_site"]',
      //   //             },
      //   //           ],
      //   //         },
      //   //       },
      //   //     },
      //   //   ],
      //   // },
      // },
      // imageModulesData: [
      //   {
      //     mainImage: {
      //       sourceUri: {
      //         uri: "https://365equipo.com/logoQrWallet.png",
      //       },
      //       contentDescription: {
      //         defaultValue: {
      //           language: "es-ES",
      //           value: "365 Obrador",
      //         },
      //       },
      //     },
      //     id: "365_banner",
      //   },
      // ],
      // textModulesData: [
      //   {
      //     header: "Gather points meeting new people at Google I/O",
      //     body: "Join the game and accumulate points in this badge by meeting other attendees in the event.",
      //     id: "game_overview",
      //   },
      // ],
      // linksModuleData: {
      //   uris: [
      //     {
      //       uri: "https://365obrador.com",
      //       description: "365 Obrador",
      //       id: "official_site",
      //     },
      //   ],
      // },
    };

    let response;
    try {
      // Check if the class exists already
      response = await httpClient.request({
        url: `${baseUrl}/genericClass/${classId}`,
        method: "GET",
      });
      console.log("La clase ya existe");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Class does not exist
        // Create it now
        response = await httpClient.request({
          url: `${baseUrl}/genericClass`,
          method: "POST",
          data: genericClass,
        });

        console.log("Class insert response");
        console.log(response);
      } else {
        console.log(err);
      }
    }
  }

  async getAllFlayers() {
    try {
      return await this.schSolicitudesCliente.getAllFlayers();
    } catch (error) {
      console.log(error);
    }
  }

  async validarFlayer(codigo: string) {
    return await this.schSolicitudesCliente.validarFlayer(codigo);
  }

  async caducarFlayer(codigo: string) {
    return await this.schSolicitudesCliente.caducarFlayer(codigo);
  }
  async deleteAllClientes() {
    return await this.schSolicitudesCliente.deleteAllClientes();
  }
}
