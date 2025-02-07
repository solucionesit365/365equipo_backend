/* eslint-disable prettier/prettier */
import { Controller, Get } from "@nestjs/common";
import { ParametrosService } from "./parametros.service";

@Controller("parametros")
export class ParametrosController {
  constructor(public readonly parametrosService: ParametrosService) {}

  @Get("getParametros")
  async getParametros() {
    return this.parametrosService.getParametros();
  }
}

