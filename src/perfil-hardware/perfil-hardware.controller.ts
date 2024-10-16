import { Controller, Body, UseGuards, Post, Get } from "@nestjs/common";
import { PerfilHardwareService } from "./perfil-hardware.service";
import { PerfilHardware } from "./perfil-hardware.interface";
import { AuthGuard } from "../guards/auth.guard";

@Controller("perfil-hardware")
export class PerfilHardwareController {
  constructor(private readonly PerfilHardwareService: PerfilHardwareService) {}

  @UseGuards(AuthGuard)
  @Post("newPerfilHardware")
  async newPerfilHardware(@Body() perfilHardwareObj: PerfilHardware) {
    try {
      return await this.PerfilHardwareService.newPerfilHardware(
        perfilHardwareObj,
      );
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getPerfiles")
  async getHardwares() {
    try {
      const respAusencias = await this.PerfilHardwareService.getPerfiles();
      if (respAusencias) return { ok: true, data: respAusencias };
      console.log(respAusencias);
    } catch (err) {
      console.log(err);
    }
  }

  @UseGuards(AuthGuard)
  @Post("deletePerfil")
  async deleteAuditoria(@Body() auditoria: PerfilHardware) {
    try {
      const respPerf = await this.PerfilHardwareService.deletePerfil(auditoria);
      if (respPerf)
        return {
          ok: true,
          data: respPerf,
        };

      throw Error("No se ha podido borrar el perfil");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
