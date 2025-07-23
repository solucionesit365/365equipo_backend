import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { AuthGuard } from "../../guards/auth.guard";
import { DeleteTurnoDto } from "../dto/turno.dto";

@Controller()
export class DeleteTurnoController {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  @UseGuards(AuthGuard)
  @Post("delete")
  deleteTurno(@Body() reqDelete: DeleteTurnoDto) {
    return this.turnoRepository.deleteTurno(reqDelete.idTurno);
  }
}
