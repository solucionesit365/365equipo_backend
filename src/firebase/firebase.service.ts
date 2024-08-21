import { Injectable } from "@nestjs/common";
import { Auth, getAuth, UserRecord } from "firebase-admin/auth";
import { App, initializeApp } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";

@Injectable()
export class FirebaseService {
  public auth: Auth = null;
  public app: App = null;
  public storage: Storage = null;

  constructor() {
    this.app = initializeApp();
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

  async generateCustomToken(uid) {
    try {
      const customToken = await this.auth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      console.error("Error generating custom token:", error);
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
      const bucketName = "gs://silema.appspot.com";
      const bucket = this.storage.bucket(bucketName);

      if (!Array.isArray(filePaths)) {
        filePaths = [filePaths];
      }

      const deletePromises = filePaths.map(async (filePath) => {
        const file = bucket.file(filePath);
        const [exists] = await file.exists();

        console.log(deletePromises);
        console.log(file);

        if (exists) {
          await file.delete();
          console.log(`Archivo ${filePath} borrado exitosamente.`);
        } else {
          console.log(`El archivo ${filePath} no existe.`);
        }
      });

      await Promise.all(deletePromises);
      console.log("Todos los archivos han sido procesados.");
    } catch (error) {
      console.error("Error al borrar los archivos:", error);
    }
  }
}
