import { Controller, Body, UseGuards, Post, Get } from "@nestjs/common";
import { HardWareInterface } from "./hardWare.interface";
import { HardwareService } from "./hardware.service";
import { AuthGuard } from "../guards/auth.guard";
import { HardwareToolGuard } from "../guards/hardwareTool.guard";

@Controller("hardware")
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @UseGuards(AuthGuard)
  @Post("newHardware")
  async addAnuncio(@Body() hardware: HardWareInterface) {
    try {
      return await this.hardwareService.newHardware(hardware);
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(HardwareToolGuard)
  @Post("newFromHardwareTool")
  async addAnuncioFromHardwareTool(@Body() hardware: HardWareInterface) {
    return await this.hardwareService.newHardware(hardware);
  }

  @UseGuards(AuthGuard)
  @Get("getHardware")
  async getHardwares() {
    try {
      return await this.hardwareService.getHardware();
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateHardware")
  async updateHardware(@Body() hardware: HardWareInterface) {
    try {
      const response = await this.hardwareService.updateHardware(hardware);

      return response;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateHardwareAll")
  async updateHardwareAll(@Body() hardware: HardWareInterface) {
    try {
      const response = await this.hardwareService.updateHardwareAll(hardware);
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
