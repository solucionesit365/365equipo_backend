import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./role.dto";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(data: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: data.name,
        permissions: {
          connect: data.permissionsIds.map((id) => ({ id })),
        },
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
}
