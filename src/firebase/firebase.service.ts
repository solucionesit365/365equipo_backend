// src/firebase/firebase.service.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Auth, getAuth, UpdateRequest, UserRecord } from "firebase-admin/auth";
import {
  App,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";

// >>> IMPORTA MESSAGING (API modular)
import { getMessaging, Messaging } from "firebase-admin/messaging";

@Injectable()
export class FirebaseService {
  public app: App = null;
  public auth: Auth = null;
  public storage: Storage = null;

  // >>> instancia de FCM
  public messaging: Messaging = null;

  constructor() {
    if (process.env.FIREBASE_CONFIG) {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      this.app = initializeApp({
        credential: cert(firebaseConfig),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.app = initializeApp({
        credential: applicationDefault(),
        projectId: "silema",
      });
    } else {
      this.app = initializeApp({
        credential: applicationDefault(),
        projectId: "silema",
        databaseURL: `https://silema.firebaseio.com`,
        storageBucket: "silema.appspot.com",
      });
    }

    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);

    // >>> crea el cliente de FCM con tu App actual
    this.messaging = getMessaging(this.app);
  }

  // ---------------- Auth & Storage (tus métodos) ----------------
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
      const customToken = await this.auth.createCustomToken(
        uid,
        additionalClaims,
      );
      return customToken;
    } catch (error) {
      console.error("Error generating custom token:", error);
      throw error;
    }
  }

  async getUserWithToken(token: string): Promise<UserRecord> {
    const decodedIdToken = await this.auth.verifyIdToken(token, true);
    return await this.auth.getUser(decodedIdToken.uid);
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
      const bucketName = "silema.appspot.com";
      const bucket = this.storage.bucket(bucketName);
      if (!Array.isArray(filePaths)) filePaths = [filePaths];

      const deletePromises = filePaths.map(async (filePath) => {
        const relativeFilePath = filePath.replace(
          /^https:\/\/storage\.googleapis\.com\/[^\/]+\//,
          "",
        );
        const file = bucket.file(relativeFilePath);
        const [exists] = await file.exists();
        if (exists) await file.delete();
      });

      await Promise.all(deletePromises);
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

  // ----------------------- FCM helpers -----------------------

  /**
   * Envía una notificación a UN token concreto
   */
  async sendPushToToken(params: {
    token: string;
    title?: string;
    body?: string;
    link?: string; // URL a abrir al hacer click (tu SW también maneja notificationclick)
    data?: Record<string, string>; // campos extra (deben ser strings)
    ttlSeconds?: number;
    iconUrl?: string;
    badgeUrl?: string;
  }) {
    const {
      token,
      title = "Notificación",
      body = "",
      link,
      data = {},
      ttlSeconds = 3600,
      iconUrl = "https://365equipo.com/android/android-launchericon-192-192.png",
      badgeUrl = "https://365equipo.com/android/android-launchericon-192-192.png",
    } = params;

    const message = {
      token,
      notification: { title, body },
      data, // llega como payload.data (string-string)
      webpush: {
        fcmOptions: link ? { link } : undefined,
        headers: { TTL: String(ttlSeconds) },
        notification: {
          icon: iconUrl,
          badge: badgeUrl,
        },
      },
    };

    return await this.messaging.send(message as any);
  }

  /**
   * Envía “dismiss” (solo data) a varios tokens para cerrar una notificación por ID
   * Úsalo con el patrón que te pasé: action=dismiss + notificationId.
   */
  async sendDismissToTokens(tokens: string[], notificationId: string) {
    if (!tokens.length) return { successCount: 0, failureCount: 0 };

    const res = await this.messaging.sendEachForMulticast({
      tokens,
      data: {
        action: "dismiss",
        notificationId,
      },
    });

    // Opcional: limpiar tokens inválidos
    // const invalid: string[] = [];
    // res.responses.forEach((r, i) => {
    //   if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
    //     invalid.push(tokens[i]);
    //   }
    // });
    // await this.tokensRepo.remove(invalid);

    return res;
  }
}
