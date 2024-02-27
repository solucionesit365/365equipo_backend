import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./permission.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

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
