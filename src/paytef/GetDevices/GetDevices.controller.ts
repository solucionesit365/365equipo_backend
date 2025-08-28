import { Controller, Get } from "@nestjs/common";
import { IGetDevicesUseCase } from "./IGetDevices.use-case";

@Controller("get-all-devices")
export class GetDevicesController {
  constructor(private readonly getDevicesUseCase: IGetDevicesUseCase) {}

  @Get()
  getAllDevices() {
    return this.getDevicesUseCase.execute();
  }

  @Get("getStatus")
  async getStatus() {
    const res = await this.getDevicesUseCase.execute();
    return res.branches;
  }
}
