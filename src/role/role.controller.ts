import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { RoleService } from "./role.service";
import {
  AddPermissionDto,
  CreateRoleDto,
  RemovePermissionDto,
} from "./role.dto";
import { AuthGuard } from "../guards/auth.guard";
import { ok } from "assert";

@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createRole(@Body() roleData: CreateRoleDto) {
    return this.roleService.createRole(roleData);
  }

  @UseGuards(AuthGuard)
  @Get("all")
  async getRoles() {
    return await this.roleService.getRoles();
  }

  @UseGuards(AuthGuard)
  @Post("addPermission")
  async addPermission(@Body() roleData: AddPermissionDto) {
    return await this.roleService.addPermission(roleData);
  }

  @UseGuards(AuthGuard)
  @Post("removePermission")
  async removePermission(@Body() roleData: RemovePermissionDto) {
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
