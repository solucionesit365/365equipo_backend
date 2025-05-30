import { Injectable } from "@nestjs/common";
import {
  AddPermissionDto,
  CreateRoleDto,
  RemovePermissionDto,
} from "./role.dto";
import { IPrismaService } from "../prisma/prisma.interface";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: IPrismaService) {}

  async createRole(data: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: data.name,
      },
    });
  }

  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    });
  }

  async getRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  async addPermission(data: AddPermissionDto) {
    return this.prisma.role.update({
      where: { id: data.roleId },
      data: {
        permissions: {
          connect: {
            id: data.permissionId,
          },
        },
      },
    });
  }

  async removePermission(data: RemovePermissionDto) {
    return this.prisma.role.update({
      where: { id: data.roleId },
      data: {
        permissions: {
          disconnect: {
            id: data.permissionId,
          },
        },
      },
    });
  }
}
