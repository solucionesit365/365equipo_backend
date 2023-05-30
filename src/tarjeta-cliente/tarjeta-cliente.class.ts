import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import { EmailClass } from "../email/email.class";
import * as openpgp from "openpgp";

@Injectable()
export class TarjetaCliente {
  constructor(private readonly emailInstance: EmailClass) {}
  async createQrCode(data: string) {
    try {
      let url = await QRCode.toDataURL(data);
      return url;
    } catch (err) {
      console.log("Error generando QR: ", err);
      return null;
    }
  }

  async encryptMessage() {
    const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----
    Version: Keybase OpenPGP v2.0.76
    Comment: https://keybase.io/crypto

    xsBNBGR1/PQBCACz/Co5vUxJvV7bGOpYWBFyCfTZVu00g9/1UZtQrSMlSbL56cIM
    D3/Yp6s8t8pz6rMe9Asw51XioyWA/jivohzkrcfRj4901r7r6cJ8p3s2UWfh/zqC
    ...

    =8zOm
    -----END PGP PUBLIC KEY BLOCK-----`;

    const message = "Este es mi mensaje secreto.";
    const passphrase = "gaga-uvah2";

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: "Hello, World!" }),
      encryptionKeys: publicKey,
    });

  }

  async sendQrCodeEmail() {
    let url = await this.createQrCode("texto de ejemplo de Eze");

    if (url) {
      const mensaje = `<p>¡Hola! Aquí está tu código QR:</p><img src="${url}"/>`;
      await this.emailInstance.enviarEmail(
        "ezequiel@solucionesit365.com",
        `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style>
              html,
              body {
                margin: 0;
                padding: 0;
                height: 100%;
              }
        
              #root {
                background-color: #4663ac;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
                  "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
                  "Helvetica Neue", sans-serif;
                font-size: 16px;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                width: 100%;
                height: 100%;
              }
        
              a {
                color: #3a8bbb;
                text-decoration: none;
                font-weight: 600;
              }
        
              #root {
                padding: 25px;
              }
        
              #logo,
              #content {
                margin: 0 auto;
              }
        
              #logo {
                display: block;
                text-align: center;
                color: #fff;
                font-size: 30px;
                font-weight: 600;
                margin-bottom: 20px;
              }
        
              #content {
                background-color: #fff;
                border-radius: 5px;
                padding: 15px;
                width: 600px;
              }
        
              #team {
                border-top: 1px solid #ddd;
                margin-top: 25px;
                padding-top: 10px;
              }
        
              .qr {
                display: block;
                width: 324px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div id="root">
              <span id="logo">365 Obrador</span>
              <div id="content">
                <p>¡Bienvenid@ al club!</p>
        
                <p>
                  Con este QR podrá indentificarse como cliente del club 365 Obrador en
                  cualquier de nuestras tiendas
                </p>
        
                <img
                  class="qr"
                  src="cid:123456"
                />
        
                <p id="team">
                  Gracias por unirse a nuestro club. ¡Esperámos verle pronto!<br />
                  Equipo 365 Obrador
                </p>
                <p></p>
              </div>
            </div>
          </body>
        </html>
        
        `,
        "Test Eze QR",
        url,
      );
      return mensaje;
    }
  }
}
