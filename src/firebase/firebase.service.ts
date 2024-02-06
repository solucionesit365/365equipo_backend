import { Injectable } from "@nestjs/common";
import { Auth, getAuth, UserRecord } from "firebase-admin/auth";
import { App, initializeApp } from "firebase-admin/app";

@Injectable()
export class FirebaseService {
  public auth: Auth = null;
  public app: App = null;

  constructor() {
    this.app = initializeApp();
    this.auth = getAuth(this.app);
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
}
