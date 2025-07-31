import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { DateTime } from "luxon";

@Controller("turnos")
export class GetTurnosUnaSemanaController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get("getTiendasUnaSemana")
  async getTiendasUnaSemana(@Query() req: { semana: number; year: number }) {
    try {
      // Crear fecha del año y semana especificados
      const fecha = DateTime.fromObject({ 
        weekNumber: req.semana, 
        weekYear: req.year 
      });
      
      // Por ahora devuelve un array vacío, necesitaría implementarse en el repositorio
      return {
        ok: true,
        data: []
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}