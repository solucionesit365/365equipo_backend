import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { BiometriaService } from "./biometria.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("biometria")
export class BiometriaController {
  constructor(private readonly biometriaService: BiometriaService) {}

  @UseGuards(AuthGuard)
  @Post("register-options")
  async registerOptions(@Body() body: any) {
    const user = body.user; // Obtener el usuario del cuerpo de la solicitud
    const options = await this.biometriaService.generateRegistrationOptions(
      user,
    );
    return options;
  }

  @UseGuards(AuthGuard)
  @Post("register")
  async register(@Body() body: any) {
    const user = body.user; // Obtener el usuario del cuerpo de la solicitud
    const verification = await this.biometriaService.verifyRegistrationResponse(
      body.credential,
      user,
    );
    return verification;
  }
}
