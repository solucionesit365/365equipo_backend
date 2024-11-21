import { Injectable } from "@nestjs/common";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { BiometriaDatabase } from "./biometria.mongodb";

@Injectable()
export class BiometriaService {
  constructor(private readonly authDbService: BiometriaDatabase) {}

  async generateRegistrationOptions(user) {
    const options = generateRegistrationOptions({
      rpName: "Ejemplo PWA",
      rpID: "365equipo.com", // Añadir rpID
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name,
      timeout: 60000,
      attestationType: "direct",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
    });

    // Guardar el challenge en la nueva colección
    await this.authDbService.saveChallenge(user.id, (await options).challenge);

    return options;
  }

  async verifyRegistrationResponse(response, user) {
    const authData = await this.authDbService.getChallenge(user.id);

    const verification = await verifyRegistrationResponse({
      response, // Usar directamente 'response' en lugar de 'credential'
      expectedChallenge: authData.challenge,
      expectedOrigin: "https://tu-dominio.com",
      expectedRPID: "tu-dominio.com",
    });

    if (verification.verified) {
      await this.authDbService.saveCredential(
        user.id,
        verification.registrationInfo,
      );
    }

    return verification;
  }
}
