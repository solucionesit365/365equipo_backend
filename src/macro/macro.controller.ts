import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from "@nestjs/common";
import { MacroService } from "./macro.service";

@Controller("macro")
export class MacroController {
  constructor(private readonly macroService: MacroService) {}

  @Post("migrate-to-v2")
  async migrateToV2() {
    try {
      await this.macroService.corregirCoordinadoras();
      await this.macroService.migrarTurnos(); // De Mongo a Prisma
      return {
        status: "Migración completada correctamente",
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
