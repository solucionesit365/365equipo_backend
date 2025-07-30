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
import { IUpdateTrabajadorOrganizacionUseCase } from "../use-cases/interfaces/IUpdateTrabajadorOrganizacion.use-case";
import { UpdateTrabajadorOrganizacionDto } from "./dto/UpdateTrabajadorOrganizacionDto";
import { LoggerService } from "src/logger/logger.service";
import { TrabajadorService } from "../trabajadores.class";

@Controller("trabajadores")
export class UpdateTrabajadorOrganizacionController {
  constructor(
    private readonly updateTrabajadorOrganizacionUseCase: IUpdateTrabajadorOrganizacionUseCase,
    private readonly loggerService: LoggerService,
    private readonly trabajadorService: TrabajadorService,
  ) {}

  @Roles("Super_Admin", "RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("actualizar-organizacion")
  async updateTrabajadorOrganizacion(
    @Body() updateTrabajadorOrganizacionDto: UpdateTrabajadorOrganizacionDto,
    @User() user: UserRecord,
  ) {
    try {
      const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
        user.uid,
      );
      const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

      await this.loggerService.create({
        action: "Actualizar Organización Trabajador",
        name: nombreUsuario,
        extraData: {
          trabajadorId: updateTrabajadorOrganizacionDto.id,
          datosOrganizacion: updateTrabajadorOrganizacionDto,
        },
      });

      const trabajadorActualizado = await this.updateTrabajadorOrganizacionUseCase.execute(
        updateTrabajadorOrganizacionDto,
      );

      return {
        ok: true,
        message: "Organización del trabajador actualizada correctamente",
        data: trabajadorActualizado,
      };
    } catch (error) {
      console.error("Error al actualizar organización del trabajador:", error);
      
      await this.loggerService.create({
        action: "Error Actualizar Organización Trabajador",
        name: user.email,
        extraData: {
          error: error.message,
          trabajadorId: updateTrabajadorOrganizacionDto.id,
        },
      });

      throw new InternalServerErrorException({
        ok: false,
        message: "Error interno del servidor al actualizar la organización del trabajador",
        error: error.message,
      });
    }
  }
}