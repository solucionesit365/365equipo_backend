import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "365Equipo API";
  }
}
