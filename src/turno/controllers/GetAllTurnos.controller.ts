import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";

@Controller("turnos")
export class GetAllTurnosController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Get("getTodos")
  async getAllTurnos() {
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