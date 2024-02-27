import { Body, Controller, Get, Post } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./permission.dto";

@Controller("permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post("create")
  async createPermission(@Body() permissionData: CreatePermissionDto) {
    return await this.permissionService.createPermission(permissionData);
  }

  @Get("all")
  async getPermissions() {
    return await this.permissionService.getPermissions();
  }
}
