import { Controller, Body, UseGuards, Post } from "@nestjs/common";
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
}
