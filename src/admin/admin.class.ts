import { Injectable } from "@nestjs/common";
import { IFirebaseService } from "../firebase/firebase.interface";

@Injectable()
export class Admin {
  constructor(private readonly authInstance: IFirebaseService) {}
  async signInWithCustomToken(email: string) {
    const uidUsuario = await this.authInstance.getUidByEmail(email);

    return await this.authInstance.generateCustomToken(uidUsuario);
  }
}
