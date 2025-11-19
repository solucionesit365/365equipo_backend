import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { Storage } from "firebase-admin/storage";
import { Readable } from "stream";
import { CryptoService } from "../crypto/crypto.class";

@Injectable()
export class StorageService {
  private storage: Storage;
  private readonly bucketName = "gs://silema.appspot.com";

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cryptoService: CryptoService,
  ) {
    this.storage = this.firebaseService.storage;
  }

  getBucket() {
    return this.storage.bucket(this.bucketName);
  }

  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucket = this.getBucket();
    const file = bucket.file(filePath);

    try {
      await file.save(fileBuffer, {
        metadata: {
          contentType: contentType,
        },
      });

      // Obtener la URL pública del archivo
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // Ajusta esta fecha según tus necesidades
      });

      return url;
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      throw error;
    }
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const bucket = this.getBucket();
    const file = bucket.file(filePath);

    try {
      const [fileContent] = await file.download();
      return fileContent;
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.firebaseService.borrarArchivo(filePath);
  }

  async listFiles(prefix?: string): Promise<string[]> {
    const bucket = this.getBucket();
    try {
      const [files] = await bucket.getFiles({ prefix });
      return files.map((file) => file.name);
    } catch (error) {
      console.error("Error al listar los archivos:", error);
      throw error;
    }
  }

  async getFileStream(filePath: string): Promise<Readable> {
    const bucket = this.getBucket();
    const file = bucket.file(filePath);

    try {
      const stream = file.createReadStream();
      return stream;
    } catch (error) {
      console.error("Error al obtener el stream del archivo:", error);
      throw error;
    }
  }
}
