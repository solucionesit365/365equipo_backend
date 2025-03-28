import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { RoleService } from "./role.service";
import {
  AddPermissionDto,
  CreateRoleDto,
  RemovePermissionDto,
} from "./role.dto";
import { AuthGuard } from "../guards/auth.guard";
import { LoggerService } from "src/logger/logger.service";
import { CompleteUser } from "src/decorators/getCompleteUser.decorator";
import { Trabajador } from "@prisma/client";

@Controller("role")
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createRole(
    @Body() roleData: CreateRoleDto,
    @CompleteUser() user: Trabajador,
  ) {
    this.loggerService.create({
      action: "Crear permiso",
      name: user.nombreApellidos,
      extraData: roleData.name,
    });
    return this.roleService.createRole(roleData);
  }

  @UseGuards(AuthGuard)
  @Get("all")
  async getRoles() {
    return await this.roleService.getRoles();
  }

  @UseGuards(AuthGuard)
  @Post("addPermission")
  async addPermission(
    @Body() roleData: AddPermissionDto,
    @CompleteUser() user: Trabajador,
  ) {
    this.loggerService.create({
      action: "Añadir permiso",
      name: user.nombreApellidos,
      extraData: roleData,
    });
    return await this.roleService.addPermission(roleData);
  }

  @UseGuards(AuthGuard)
  @Post("removePermission")
  async removePermission(
    @Body() roleData: RemovePermissionDto,
    @CompleteUser() user: Trabajador,
  ) {
    this.loggerService.create({
      action: "Borrar permiso",
      name: user.nombreApellidos,
      extraData: roleData,
    });
    return await this.roleService.removePermission(roleData);
  }

  @UseGuards(AuthGuard)
  @Get("getRoleId")
  async getRoleById(@Query() { id }: { id: string }) {
    const resp = await this.roleService.getRoleById(id);
    return {
      ok: true,
      data: resp,
    };
  }

  // @Post("update")
  // async updateRole(@Body() roleData: CreateRoleDto) {
  //   return await this.roleService.updateRole(roleData);
  // }
}
