import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreatePermissionDto } from "./permission.dto";
import { AuthGuard } from "../guards/auth.guard";
import { IPermissionService } from "./permission.interface";

@Controller("permission")
export class PermissionController {
  constructor(private readonly permissionService: IPermissionService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createPermission(@Body() permissionData: CreatePermissionDto) {
    return await this.permissionService.createPermission(permissionData);
  }

  @UseGuards(AuthGuard)
  @Get("all")
  async getPermissions() {
    return await this.permissionService.getPermissions();
  }
}
