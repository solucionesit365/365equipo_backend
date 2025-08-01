import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Auth, getAuth, UpdateRequest, UserRecord } from "firebase-admin/auth";
import {
  App,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";

@Injectable()
export class FirebaseService {
  public auth: Auth = null;
  public app: App = null;
  public storage: Storage = null;

  constructor() {
    if (process.env.FIREBASE_CONFIG) {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      this.app = initializeApp({
        credential: cert(firebaseConfig),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Si hay una ruta a un archivo de credenciales, usarlo
      this.app = initializeApp({
        credential: applicationDefault(),
        projectId: 'silema',
      });
    } else {
      // En desarrollo, intentar usar las credenciales de gcloud
      // pero con configuración adicional para evitar el error de metadata
      this.app = initializeApp({
        credential: applicationDefault(),
        projectId: 'silema',
        databaseURL: `https://silema.firebaseio.com`,
        storageBucket: 'silema.appspot.com',
      });
    }

    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
  }

  async verifyToken(token: string) {
    return await this.auth.verifyIdToken(token, true);
  }

  async getUidByEmail(email: string) {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      return userRecord.uid;
    } catch (error) {
      console.error("Error fetching user by email:", error);
    }
  }

  async generateCustomToken(uid: string, additionalClaims?: object) {
    try {
      const customToken = await this.auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error("Error generating custom token:", error);
      throw error;
    }
  }

  async getUserWithToken(token: string): Promise<UserRecord> {
    const decodedIdToken = await this.auth.verifyIdToken(token, true);
    const user = await this.auth.getUser(decodedIdToken.uid);

    return user;
  }

  async getUserByUid(uid: string) {
    try {
      return await this.auth.getUser(uid);
    } catch (error) {
      console.error("No se ha podido encontrar el usuario por uid", error);
    }
  }

  async borrarArchivo(filePaths: string | string[]) {
    try {
      const bucketName = "silema.appspot.com"; // Solo el nombre del bucket, sin 'gs://'
      const bucket = this.storage.bucket(bucketName);

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

  async updateFirebaseUser(userData: UpdateRequest, userId: string) {
    try {
      await this.auth.updateUser(userId, userData);
    } catch (error) {
      console.error("Error updating Firebase user:", error);
      throw new InternalServerErrorException(
        "No se ha podido actualizar el usuario en Firebase",
      );
    }
  }

  async setCustomUserClaims(uid: string, customClaims: object) {
    try {
      await this.auth.setCustomUserClaims(uid, customClaims);
    } catch (error) {
      console.error("Error setting custom claims:", error);
      throw new InternalServerErrorException(
        "No se ha podido establecer los claims personalizados",
      );
    }
  }
  async descargarArchivo(filePath: string): Promise<Buffer> {
    const bucketName = "silema.appspot.com";
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(filePath);

    try {
      const [fileExists] = await file.exists();
      if (!fileExists) {
        throw new Error(`El archivo ${filePath} no existe en el bucket.`);
      }

      const [fileBuffer] = await file.download();
      return fileBuffer;
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      throw new InternalServerErrorException(
        "No se ha podido descargar el archivo",
      );
    }
  }
}
