import { Body, Controller, Post } from "@nestjs/common";
import { CopiarTurnosPorSemanaDto } from "../dto/turno.dto";
import { ICopiarTurnosPorSemanaUseCase } from "../use-cases/interfaces/ICopiarTurnosPorSemana.use-case";
import { DateTime } from "luxon";

@Controller("copiar-turnos-por-semana")
export class CopiarTurnoPorSemanaController {
  constructor(
    private readonly copiarTurnosPorSemanaUseCase: ICopiarTurnosPorSemanaUseCase,
  ) {}

  @Post()
  async copiarTurnosPorSemana(
    @Body() reqCopiarTurnosPorSemana: CopiarTurnosPorSemanaDto,
  ) {
    // Await porque es void
    await this.copiarTurnosPorSemanaUseCase.execute(
      reqCopiarTurnosPorSemana.idTienda,
      DateTime.fromISO(reqCopiarTurnosPorSemana.diaSemanaOrigen),
      DateTime.fromISO(reqCopiarTurnosPorSemana.diaSemanaDestino),
    );

    return true;
  }
}
