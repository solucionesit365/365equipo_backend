import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Auth, getAuth, UpdateRequest, UserRecord } from "firebase-admin/auth";
import {
  App,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";

import { IFirebaseService } from "./firebase.interface";

@Injectable()
export class FirebaseService implements IFirebaseService {
  private auth: Auth = null;
  private app: App = null;

  constructor() {
    if (process.env.FIREBASE_CONFIG) {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      this.app = initializeApp({
        credential: cert(firebaseConfig),
      });
    } else {
      this.app = initializeApp({
        credential: applicationDefault(),
      });
    }

    this.auth = getAuth(this.app);
  }

  async verifyToken(token: string) {
    return await this.auth.verifyIdToken(token, true);
  }

  getApp() {
    return this.app;
  }

  getAuth() {
    return this.auth;
  }

  async getUidByEmail(email: string) {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      return userRecord.uid;
    } catch (error) {
      console.error("Error fetching user by email:", error);
    }
  }

  async generateCustomToken(uid: string) {
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

  async updateFirebaseUser(userData: UpdateRequest) {
    try {
      await this.auth.updateUser("userUID", userData);
    } catch (error) {
      console.error("Error updating Firebase user:", error);
      throw new InternalServerErrorException(
        "No se ha podido actualizar el usuario en Firebase",
      );
    }
  }
}
