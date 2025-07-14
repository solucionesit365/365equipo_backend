import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ITurnoRepository } from "../turno.repository.interface";
import { AuthGuard } from "src/guards/auth.guard";
import { GetSemanaIndividual } from "../dto/turno.dto";
import { DateTime } from "luxon";

@Controller("get-turnos-semanales-trabajador")
export class GetTurnosSemanalesTrabajadorController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get()
  getSemanaIndividual(@Query() req: GetSemanaIndividual) {
    return this.turnoRepository.getTurnosPorTrabajador(
      req.idTrabajador,
      DateTime.fromISO(req.fecha),
    );
  }
}
