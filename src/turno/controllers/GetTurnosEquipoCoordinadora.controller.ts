import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { GetTurnosEquipoCoordinadora } from "../dto/turno.dto";
import { DateTime } from "luxon";
import { GetTurnosEquipoCoordinadoraUseCase } from "../use-cases/GetTurnosEquipoCoordinadora.use-case";

@Controller("GetTurnosEquipoCoordinadora")
export class GetTurnosEquipoCoordinadoraController {
  constructor(
    private readonly getTurnosEquipoCoordinadoraUseCase: GetTurnosEquipoCoordinadoraUseCase,
  ) {}

  @UseGuards(AuthGuard)
  @Get() // Incluye los externos fuera del equipo de la coordi
  async turnosCoordinadoraTienda(@Query() req: GetTurnosEquipoCoordinadora) {
    const fecha = DateTime.fromISO(req.fecha);

    if (!fecha.isValid) throw new InternalServerErrorException();

    return this.getTurnosEquipoCoordinadoraUseCase.execute(req.idTienda, fecha);
  }
}
