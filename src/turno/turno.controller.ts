import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { TurnoService } from "./turno.service";
import { GetTurnosCoordinadora } from "./turno.dto";
import { DateTime } from "luxon";

@Controller("turno")
export class TurnoController {
  constructor(private readonly turnoService: TurnoService) {}

  @UseGuards(AuthGuard)
  @Get("getTurnosCoordinadora") // Incluye los externos fuera del equipo de la coordi
  async turnosCoordinadoraTienda(@Query() req: GetTurnosCoordinadora) {
    const fecha = DateTime.fromISO(req.fecha);
    if (!fecha.isValid) throw new InternalServerErrorException();
    return this.turnoService.getTurnosCoordinadora(req.idTienda, fecha);
  }
}
