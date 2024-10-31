import { Injectable } from "@nestjs/common";
import { PerfilHardwareDatabase } from "./perfil-hardware.mongodb";
import { PerfilHardware } from "./perfil-hardware.interface";
@Injectable()
export class PerfilHardwareService {
  constructor(
    private readonly perfilHardwareDatabase: PerfilHardwareDatabase,
  ) {}

  async newPerfilHardware(perfilesHardware: PerfilHardware) {
    this.perfilHardwareDatabase.newPerfilHardware(perfilesHardware);
    return {
      ok: true,
      data: "Perfil de Hardware creado",
    };
  }
  async getPerfiles() {
    return await this.perfilHardwareDatabase.getPerfilesH();
  }
  async deletePerfil(perfil: PerfilHardware) {
    return await this.perfilHardwareDatabase.deletePerfil(perfil);
  }
}
