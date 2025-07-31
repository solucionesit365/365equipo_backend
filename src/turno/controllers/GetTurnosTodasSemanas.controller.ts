import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";

@Controller("turnos")
export class GetTurnosTodasSemanasController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get("getTiendaTodasSemanas")
  async getTiendaTodasSemanas(@Query() req: { idTienda: number }) {
    try {
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