import { Controller, Get, UseGuards } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { AuthGuard } from "../guards/auth.guard";
import { Roles } from "../decorators/role.decorator";
import { RoleGuard } from "../guards/role.guard";

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Roles()
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getLogs() {
    return await this.loggerService.getLogs();
  }
}
