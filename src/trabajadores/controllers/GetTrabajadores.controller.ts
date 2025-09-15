import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { AuthGuard } from "../../guards/auth.guard";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../decorators/role.decorator";
import { GetTrabajadoresDto } from "./dto/GetTrabajadoresDto";

@Controller("get-trabajadores")
export class GetTrabajadoresController {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  @Roles("SUPER_ADMIN", "RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  handle(@Query() req: GetTrabajadoresDto) {
    return this.trabajadorRepository.readAll({
      sonPersonas: req.sonPersonas,
      sonTiendas: req.sonTiendas,
    });
  }
}
