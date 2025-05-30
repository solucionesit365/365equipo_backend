import { Injectable } from "@nestjs/common";
import { IFirebaseService } from "../firebase/firebase.interface";
import { getStorage, Storage } from "firebase-admin/storage";
import { Readable } from "stream";
import { IStorageService } from "./storage.interface";

@Injectable()
export class StorageService implements IStorageService {
  private storage: Storage;
  private readonly bucketName = "gs://silema.appspot.com";

  constructor(private readonly firebaseService: IFirebaseService) {}

  protected getBucket() {
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

  async deleteFile(filePaths: string | string[]): Promise<void> {
    const App = this.firebaseService.getApp();
    const storage = getStorage(App);

    try {
      // Solo el nombre del bucket, sin 'gs://'
      const bucketName = "silema.appspot.com";
      const bucket = storage.bucket(bucketName);

      if (!Array.isArray(filePaths)) {
        filePaths = [filePaths];
      }

      const deletePromises = filePaths.map(async (filePath) => {
        // Asegúrate de que 'filePath' no incluya el prefijo completo de la URL.
        // Debe ser algo como 'videos/archivo.mp4'
        const relativeFilePath = filePath.replace(
          /^https:\/\/storage\.googleapis\.com\/[^\/]+\//,
          "",
        );
        const file = bucket.file(relativeFilePath);
        const [exists] = await file.exists();

        if (exists) {
          await file.delete();
          console.log(`Archivo ${relativeFilePath} borrado exitosamente.`);
        } else {
          console.log(`El archivo ${relativeFilePath} no existe.`);
        }
      });

      await Promise.all(deletePromises);
      console.log("Todos los archivos han sido procesados.");
    } catch (error) {
      console.error("Error al borrar los archivos:", error);
    }
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
