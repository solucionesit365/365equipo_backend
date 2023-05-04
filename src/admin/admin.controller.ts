import { Controller, Post, Body } from "@nestjs/common";
import { Admin } from "./admin.class";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminInstance: Admin) {}
  @Post("signInWithCustomToken")
  async signInWithCustomToken(@Body() { email, password }) {
    try {
      if (email && password === process.env.SUPER_SECRET) {
        return {
          ok: true,
          data: await this.adminInstance.signInWithCustomToken(email),
        };
      } else throw Error("Identificación como administrador incorrecta");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
