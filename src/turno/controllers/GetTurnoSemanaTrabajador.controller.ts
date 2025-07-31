import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { DateTime } from "luxon";

@Controller("turnos")
export class GetTurnoSemanaTrabajadorController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get("cuadranteSemanaTrabajador")
  async getCuadranteSemanaTrabajador(@Query() req: { idTrabajador: number; fecha: string }) {
    try {
      const fecha = DateTime.fromISO(req.fecha);
      const turnos = await this.turnoRepository.getTurnosPorTrabajador(
        req.idTrabajador,
        fecha
      );
      
      return {
        ok: true,
        data: turnos
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}