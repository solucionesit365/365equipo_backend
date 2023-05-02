import { Injectable } from "@nestjs/common";
import { generateCustomToken, getUidByEmail } from "../firebase/auth";

@Injectable()
export class Admin {
  async signInWithCustomToken(email: string) {
    const uidUsuario = await getUidByEmail(email);

    return await generateCustomToken(uidUsuario);
  }
}
