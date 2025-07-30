import {
  Controller,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../decorators/role.decorator";
import { User } from "../../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { IUpdateTrabajadorUseCase } from "../use-cases/interfaces/IUpdateTrabajador.use-case";
import { UpdateTrabajadorDto } from "./dto/UpdateTrabajadorDto";
import { LoggerService } from "src/logger/logger.service";
import { TrabajadorService } from "../trabajadores.class";

@Controller("trabajadores")
export class UpdateTrabajadorController {
  constructor(
    private readonly updateTrabajadorUseCase: IUpdateTrabajadorUseCase,
    private readonly loggerService: LoggerService,
    private readonly trabajadorService: TrabajadorService,
  ) {}

  @Roles("Super_Admin", "RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("actualizar")
  async updateTrabajador(
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
    @User() user: UserRecord,
  ) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );
    const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

    await this.loggerService.create({
      action: "Actualizar Trabajador",
      name: nombreUsuario,
      extraData: {
        trabajadorActualizado: updateTrabajadorDto,
      },
    });

    const trabajadorActualizado = await this.updateTrabajadorUseCase.executeOne(
      updateTrabajadorDto,
    );

    return trabajadorActualizado;
  }
}
