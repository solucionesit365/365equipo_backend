import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { DateTime } from "luxon";

@Controller("turnos")
export class GetTurnosSupersController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get("getCuadranteSupers")
  async getCuadranteSupers(@Query() req: { idTienda: number; fecha: string }) {
    try {
      const fecha = DateTime.fromISO(req.fecha);
      const idTiendaNum = Number(req.idTienda);
      const turnos = await this.turnoRepository.getTurnosPorTienda(
        idTiendaNum,
        fecha,
      );

      return {
        ok: true,
        data: turnos,
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
