import { Controller, Body, UseGuards, Post, Get } from "@nestjs/common";
import { PerfilHardwareService } from "./perfil-hardware.service";
import { PerfilHardware } from "./perfil-hardware.interface";
import { AuthGuard } from "../guards/auth.guard";

/**
 * Controller for managing hardware profiles.
 */
@Controller("perfil-hardware")
export class PerfilHardwareController {
  constructor(private readonly PerfilHardwareService: PerfilHardwareService) {}

  /**
   * Creates a new hardware profile.
   * @param perfilHardwareObj - The hardware profile object to be created.
   * @returns A promise that resolves to the created hardware profile or an error object.
   */
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

  /**
   * Retrieves all hardware profiles.
   * @returns A promise that resolves to an object containing the retrieved profiles or undefined.
   */
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

  /**
   * Deletes a hardware profile.
   * @param perfil - The hardware profile to be deleted.
   * @returns A promise that resolves to an object indicating the success or failure of the deletion.
   */
  @UseGuards(AuthGuard)
  @Post("deletePerfil")
  async deletPerfil(@Body() perfil: PerfilHardware) {
    try {
      const respPerf = await this.PerfilHardwareService.deletePerfil(perfil);
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
