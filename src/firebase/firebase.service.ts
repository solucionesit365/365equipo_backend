import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Auth, getAuth, UserRecord } from "firebase-admin/auth";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { App, initializeApp } from "firebase-admin/app";

@Injectable()
export class FirebaseService {
  public auth: Auth = null;
  public app: App = null;

  constructor(
    @Inject(forwardRef(() => TrabajadorService))
    private trabajadorInstance: TrabajadorService,
  ) {
    this.app = initializeApp();
    this.auth = getAuth(this.app);
  }

  async verifyToken(token: string) {
    await this.auth.verifyIdToken(token, true);
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

  async getUserWithToken(token: string): Promise<TrabajadorCompleto> {
    const decodedIdToken = await this.auth.verifyIdToken(token, true);
    const user: Omit<UserRecord, "toJSON"> = await this.auth.getUser(
      decodedIdToken.uid,
    );

    if (user) {
      const resUser = await this.trabajadorInstance.getTrabajadorByAppId(
        user.uid,
      );

      return { ...user, ...resUser };

      // await recSoluciones(
      //   "soluciones",
      //   `
      //   SELECT * FROM trabajadores WHERE idApp = @param0`,
      //   user.uid,
      // );

      // if (resUser.recordset?.length > 0) {
      //   return { ...user, ...resUser.recordset[0] };
      // }
      // throw Error("Usuario no encontrado en SQL");
    }

    throw Error("No se ha podido obtener el usuario");
  }

  async getUserByUid(uid: string) {
    try {
      return await this.auth.getUser(uid);
    } catch (error) {
      console.error("No se ha podido encontrar el usuario por uid", error);
    }
  }
}
