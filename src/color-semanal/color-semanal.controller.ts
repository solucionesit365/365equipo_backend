import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import ColorValidation from "./color-semanal.dto";
import { ColorSemanalService } from "./color-semanal.service";
import { AuthGuard } from "../guards/auth.guard";
import { RoleGuard } from "../guards/role.guard";
import { Roles } from "../decorators/role.decorator";

@Controller("color-semanal")
export class ColorSemanalController {
  constructor(private readonly colorSemanalService: ColorSemanalService) {}

  @Roles("COLOR_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("saveColorIn")
  async saveColor(@Body() { color }: ColorValidation) {
    return await this.colorSemanalService.saveColorIn(color);
  }

  @UseGuards(AuthGuard)
  @Get("getColors")
  async getColors() {
    return await this.colorSemanalService.getColors();
  }
}
