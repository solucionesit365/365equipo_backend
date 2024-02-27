import { Body, Controller, Post } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./role.dto";

@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post("create")
  async createRole(@Body() roleData: CreateRoleDto) {
    return this.roleService.createRole(roleData);
  }
}
