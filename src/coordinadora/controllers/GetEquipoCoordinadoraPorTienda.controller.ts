import { Controller, Get, Query } from "@nestjs/common";
import { GetEquipoCoordinadoraPorTiendaDto } from "./dto";
import { IGetEquipoCoordinadoraPorTienda } from "../use-cases/interfaces/IGetEquipoCoordinadoraPorTienda.use-case";

@Controller("get-equipo-coordinadora-por-tienda")
export class GetEquipoCoordinadoraController {
  constructor(
    private readonly getEquipoCoordinadoraPorTiendaUseCase: IGetEquipoCoordinadoraPorTienda,
  ) {}

  @Get()
  getEquipoCoordinadoraPorTienda(
    @Query() reqGetEquipo: GetEquipoCoordinadoraPorTiendaDto,
  ) {
    return this.getEquipoCoordinadoraPorTiendaUseCase.execute(
      reqGetEquipo.idTienda,
    );
  }
}
