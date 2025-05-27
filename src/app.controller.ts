import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    console.log("esto guau");
    return "365Equipo API";
  }
}
