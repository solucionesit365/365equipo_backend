import { Controller, Get, UseGuards } from "@nestjs/common";
import { IGetTiendasAteneaUseCase } from "./IGetTiendasAtenea.use-case";
import { AuthGuard } from "../../guards/auth.guard";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../decorators/role.decorator";
import { SchedulerGuard } from "../../guards/scheduler.guard";

@Controller("get-tiendas-atenea")
export class GetTiendasAteneaController {
  constructor(private readonly getTiendasAteneaUseCase: IGetTiendasAteneaUseCase) {}

  @Roles("RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  handle() {
    return this.getTiendasAteneaUseCase.execute();
  }

  @UseGuards(SchedulerGuard)
  @Get("atenea")
  handleForAtenea() {
    return this.getTiendasAteneaUseCase.execute();
  }
}
