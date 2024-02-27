import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core"; // Importa Reflector
import { UserRecord } from "firebase-admin/auth";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {} // Inyecta Reflector

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>("roles", context.getHandler()); // Correctamente leyendo los metadatos

    if (!roles) {
      return true; // Si no hay roles definidos, permite el acceso
    }
    const request = context.switchToHttp().getRequest();
    const user: UserRecord = request.user;

    try {
      const userRoles = await this.prisma.trabajador.findUnique({
        where: {
          idApp: user.uid,
        },
        include: {
          roles: true,
          permisos: true,
        },
      });

      const hasRole = userRoles.roles.some((role) => roles.includes(role.name));

      if (!hasRole) {
        throw new UnauthorizedException(
          "No tienes permiso para realizar esta acción",
        );
      }
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException("No estás autorizado/a");
    }
    return true;
  }
}
