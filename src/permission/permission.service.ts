import { Injectable } from "@nestjs/common";
import { CreatePermissionDto } from "./permission.dto";
import { IPrismaService } from "../prisma/prisma.interface";
import { IPermissionService } from "./permission.interface";

@Injectable()
export class PermissionService implements IPermissionService {
  constructor(private readonly prisma: IPrismaService) {}

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
