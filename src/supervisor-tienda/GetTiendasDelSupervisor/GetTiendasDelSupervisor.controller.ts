import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { IGetTiendasDelSupervisor } from "./IGetTiendasDelSupervisor.use-case";
import { AuthGuard } from "../../guards/auth.guard";
import { GetTiendasACargoDto } from "./dto";

@Controller("get-tiendas-del-supervisor")
export class GetTiendasDelSupervisorController {
  constructor(
    private readonly getTiendasDelSupervisorUseCase: IGetTiendasDelSupervisor,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTiendasACargo(@Query() reqGetTiendasACargo: GetTiendasACargoDto) {
    try {
      if (!reqGetTiendasACargo.idSupervisor) {
        throw new Error("idSupervisor es requerido");
      }

      const result = await this.getTiendasDelSupervisorUseCase.execute(
        reqGetTiendasACargo.idSupervisor,
      );

      return result;
    } catch (error) {
      console.error("Error en getTiendasACargo controller:", error);
      throw error;
    }
  }
}
