import { Injectable } from "@nestjs/common";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createECDH,
} from "crypto";

@Injectable()
export class CryptoClass {
  private curve: string;
  private ecdh = createECDH("secp521r1");

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
    const cipher = createCipheriv("aes-256-cbc", key.subarray(0, 32), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decrypt(key: Buffer, encryptedText: string): string {
    const [ivText, encryptedTextWithoutIv] = encryptedText.split(":");
    const iv = Buffer.from(ivText, "hex");
    const encryptedTextBuffer = Buffer.from(encryptedTextWithoutIv, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key.subarray(0, 32), iv);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  cifrarMensaje(message: string, hexPublicKey: string) {
    const sharedSecret = this.computeSharedSecret(hexPublicKey);
    return this.encrypt(sharedSecret, message);
  }

  cifrarParaHit(message: string) {
    this.ecdh.setPrivateKey(
      Buffer.from(process.env.SOLUCIONES_PRIVATE_KEY, "hex"),
    );

    if (process.env.HIT_PUBLIC_KEY) {
      const sharedSecret = this.computeSharedSecret(process.env.HIT_PUBLIC_KEY);
      return this.encrypt(sharedSecret, message);
    }
    throw Error("La clave pública del destinatario es incorrecta");
  }

  // Establecido a Hit
  descifrar(encryptedMessage: string) {
    if (!process.env.HIT_PRIVATE_KEY || !process.env.HIT_PUBLIC_KEY)
      throw Error("Las keys no están bien definidas");

    this.ecdh.setPrivateKey(Buffer.from(process.env.HIT_PRIVATE_KEY, "hex"));

    // También se comprueba de quién viene el mensaje
    return this.decrypt(
      this.computeSharedSecret(process.env.SOLUCIONES_PUBLIC_KEY),
      encryptedMessage,
    );
  }

  //   test() {
  //     const myPrivateKey = process.env.SOLUCIONES_PRIVATE_KEY;
  //     // const myPublicKey = process.env.SOLUCIONES_PUBLIC_KEY;
  //     const otherPublicKey = process.env.HIT_PUBLIC_KEY;

  //     this.ecdh.setPrivateKey(Buffer.from(myPrivateKey, "hex"));

  //     const datitos = {
  //       idCliente: "CliBoti_225_20170306075342",
  //       nombre: "Ezequiel Andres Carissimo Oms",
  //     };
  //     const message = JSON.stringify(datitos);
  //     const encryptedMessage =
  //       "87a644a7d37aebfb95983a9c66759c17:0e3733f5f4e5ec1757ca5bcc3097c58c5f4db22c5739e9b8fd1cd7963310eb83a6f3da8665d1ea9c97ad4bb434997620ad8785c078f6c37ef39df831550bd5dda36890145e55b1852296eb4b72f2f2e65757c9e0193ac502d0d92907f1f04220";
  //     // this.cifrarMensaje(message, otherPublicKey);

  //     console.log("Encrypted Message:", encryptedMessage);

  //     const decryptedMessage = this.decrypt(
  //       this.computeSharedSecret(otherPublicKey),
  //       encryptedMessage,
  //     );

  //     console.log("Decrypted Message:", decryptedMessage);
  //   }
}
