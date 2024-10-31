import { Controller, Body, UseGuards, Post, Get } from "@nestjs/common";
import { HardWareInterface } from "./hardWare.interface";
import { HardwareService } from "./hardware.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("hardware")
export class HardwareController {
  constructor(private readonly HardwareService: HardwareService) {}

  @UseGuards(AuthGuard)
  @Post("newHardware")
  async addAnuncio(@Body() hardware: HardWareInterface) {
    try {
      return await this.HardwareService.newHardware(hardware);
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getHardware")
  async getHardwares() {
    try {
      return await this.HardwareService.getHardware();
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateHardware")
  async updateHardware(@Body() hardware: HardWareInterface) {
    try {
      const response = await this.HardwareService.updateHardware(hardware);

      return response;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
