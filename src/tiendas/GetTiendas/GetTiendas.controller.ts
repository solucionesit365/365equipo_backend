import { Controller, Get, UseGuards } from "@nestjs/common";
import { IGetTiendasUseCase } from "./IGetTiendas.use-case";
import { AuthGuard } from "../../guards/auth.guard";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../decorators/role.decorator";
import { SchedulerGuard } from "../../guards/scheduler.guard";

@Controller("get-tiendas")
export class GetTiendasController {
  constructor(private readonly getTiendasUseCase: IGetTiendasUseCase) {}

  @Roles("RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  handle() {
    return this.getTiendasUseCase.execute();
  }

  @UseGuards(SchedulerGuard)
  @Get("for-atenea")
  handleForAtenea() {
    return this.getTiendasUseCase.execute();
  }
}
