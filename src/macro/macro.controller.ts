import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { MacroService } from "./macro.service";
import { SchedulerGuard } from "../guards/scheduler.guard";

@Controller("macro")
export class MacroController {
  constructor(private readonly macroService: MacroService) {}

  @UseGuards(SchedulerGuard)
  @Post("solo-coordinadoras")
  async mantenimientoCoordinadoras() {
    try {
      await this.macroService.corregirCoordinadoras();
      return {
        status: "Migración completada correctamente",
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(SchedulerGuard)
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
