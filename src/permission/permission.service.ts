import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePermissionDto } from "./permission.dto";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPermission(permission: CreatePermissionDto) {
    return await this.prisma.permiso.create({
      data: {
        name: permission.name,
      },
    });
  }

  async getPermissions() {
    return await this.prisma.permiso.findMany();
  }

  async getPermissionById(id: string) {
    return await this.prisma.permiso.findUnique({
      where: { id },
    });
  }

  async deletePermission(id: string) {
    return await this.prisma.permiso.delete({
      where: { id },
    });
  }
}
