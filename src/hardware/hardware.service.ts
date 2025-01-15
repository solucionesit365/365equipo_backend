import { Injectable } from "@nestjs/common";
import { HardwareDatabase } from "./hardware.mongodb";
import { HardWareInterface } from "./hardWare.interface";

@Injectable()
export class HardwareService {
  constructor(private readonly hardwareDatabase: HardwareDatabase) {}

  async newHardware(hardWare: HardWareInterface) {
    this.hardwareDatabase.newHardWare(hardWare);
    return {
      ok: true,
      data: "Dispositivo creado",
    };
  }

  async getHardware() {
    return await this.hardwareDatabase.getHardware();
  }

  async updateHardware(hardWare: HardWareInterface) {
    return await this.hardwareDatabase.updateHardware(hardWare);
  }

  async updateHardwareAll(hardWare: HardWareInterface) {
    return await this.hardwareDatabase.updateHardwareAll(hardWare);
  }
}
