import { Controller, Get } from "@nestjs/common";

@Controller("permisos")
export class PermisosController {
  @Get("listaCompleta")
  async listaCompleta() {
    try {
      return { ok: true, data: ["RRHH_ADMIN", "SUPER_ADMIN"] };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
