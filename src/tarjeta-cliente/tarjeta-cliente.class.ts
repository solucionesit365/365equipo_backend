import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import { EmailClass } from "../email/email.class";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createECDH,
} from "crypto";

@Injectable()
export class TarjetaCliente {
  // private readonly curve = "secp521r1";
  private curve: string;
  private ecdh = createECDH("secp521r1");
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

  generarClaves(): void {
    this.ecdh.generateKeys();
    console.log("Private key:", this.ecdh.getPrivateKey().toString("hex"));
    console.log("Public key:", this.ecdh.getPublicKey().toString("hex"));
  }

  computeSharedSecret(hexPublicKey: string) {
    const publicKeyBuffer = Buffer.from(hexPublicKey, "hex");
    return this.ecdh.computeSecret(publicKeyBuffer);
  }

  encrypt(key: Buffer, text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", key.slice(0, 32), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decrypt(key: Buffer, encryptedText: string): string {
    const [ivText, encryptedTextWithoutIv] = encryptedText.split(":");
    const iv = Buffer.from(ivText, "hex");
    const encryptedTextBuffer = Buffer.from(encryptedTextWithoutIv, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key.slice(0, 32), iv);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  encriptarMensaje(message: string, hexPublicKey: string) {
    const sharedSecret = this.computeSharedSecret(hexPublicKey);
    return this.encrypt(sharedSecret, message);
  }

  test() {
    const myPrivateKey = process.env.SOLUCIONES_PRIVATE_KEY;
    const myPublicKey = process.env.SOLUCIONES_PUBLIC_KEY;
    const otherPublicKey = process.env.HIT_PUBLIC_KEY;

    this.ecdh.setPrivateKey(Buffer.from(myPrivateKey, "hex"));

    const datitos = {
      idCliente: "CliBoti_225_20170306075342",
      nombre: "Ezequiel Andres Carissimo Oms",
    };
    const message = JSON.stringify(datitos);
    const encryptedMessage =
      "87a644a7d37aebfb95983a9c66759c17:0e3733f5f4e5ec1757ca5bcc3097c58c5f4db22c5739e9b8fd1cd7963310eb83a6f3da8665d1ea9c97ad4bb434997620ad8785c078f6c37ef39df831550bd5dda36890145e55b1852296eb4b72f2f2e65757c9e0193ac502d0d92907f1f04220"; // this.encriptarMensaje(message, otherPublicKey);

    console.log("Encrypted Message:", encryptedMessage);

    const decryptedMessage = this.decrypt(
      this.computeSharedSecret(otherPublicKey),
      encryptedMessage,
    );

    console.log("Decrypted Message:", decryptedMessage);
  }
}
