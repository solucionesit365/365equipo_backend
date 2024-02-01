import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/auth";

@Injectable()
export class Admin {
  constructor(private readonly authInstance: FirebaseService) {}
  async signInWithCustomToken(email: string) {
    const uidUsuario = await this.authInstance.getUidByEmail(email);

    return await this.authInstance.generateCustomToken(uidUsuario);
  }
}
