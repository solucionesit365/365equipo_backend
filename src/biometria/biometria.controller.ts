import { Controller, Post, Body, Req } from "@nestjs/common";
import { BiometriaService } from "./biometria.service";
import { Request } from "express";

@Controller("biometria")
export class BiometriaController {
  constructor(private readonly biometriaService: BiometriaService) {}

  @Post("register-options")
  async registerOptions(@Body() body: any, @Req() req: Request) {
    const user = body.user; // Obtener el usuario del cuerpo de la solicitud
    const options = await this.biometriaService.generateRegistrationOptions(
      user,
    );
    return options;
  }

  @Post("register")
  async register(@Body() body: any, @Req() req: Request) {
    const user = body.user; // Obtener el usuario del cuerpo de la solicitud
    const verification = await this.biometriaService.verifyRegistrationResponse(
      body.credential,
      user,
    );
    return verification;
  }
}
