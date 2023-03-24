import { Controller, Get, Headers, Query } from "@nestjs/common";
import { verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { trabajadorInstance } from "./trabajadores.class";

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getTrabajadores(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const arrayTrabajadores = await trabajadorInstance.getTrabajadores();

      return { ok: true, data: arrayTrabajadores };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getTrabajadorByAppId")
  async getTrabajadorByAppId(
    @Headers("authorization") authHeader: string,
    @Query() { uid },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const resUser = await trabajadorInstance.getTrabajadorByAppId(uid);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
