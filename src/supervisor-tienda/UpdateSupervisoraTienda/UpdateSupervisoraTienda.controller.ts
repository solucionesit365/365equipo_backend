import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/auth.guard";
import { UpdateSupervisoraTiendaDto } from "./UpdateSupervisoraTienda.dto";
import { IUpdateSupervisoraTiendaUseCase } from "./IUpdateSupervisoraTienda.use-case";

@Controller("update-supervisora-tienda")
export class UpdateSupervisoraTiendaController {
  constructor(
    private readonly updateSupervisoraTiendaUseCase: IUpdateSupervisoraTiendaUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async updateSupervisoraTienda(@Body() req: UpdateSupervisoraTiendaDto) {
    return await this.updateSupervisoraTiendaUseCase.execute(
      req.tiendasIds,
      req.idSupervisora,
    );
  }
}
