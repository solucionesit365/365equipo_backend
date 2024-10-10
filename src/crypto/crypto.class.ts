import { Injectable } from "@nestjs/common";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createECDH,
  createHash,
} from "crypto";

@Injectable()
export class CryptoService {
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

  hashFile(file: Buffer): string {
    return createHash("sha512").update(file).digest("hex");
  }
}
