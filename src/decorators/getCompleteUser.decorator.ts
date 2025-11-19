import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma, Trabajador } from "@prisma/client";

export interface ICompleteUser
  extends Prisma.TrabajadorGetPayload<{
    include: { roles: true; permisos: true };
  }> {}

export const CompleteUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Trabajador => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.sqlUser) {
      throw new InternalServerErrorException("No se pudo obtener el usuario");
    }

    return request.sqlUser as Prisma.TrabajadorGetPayload<{
      include: { roles: true; permisos: true };
    }>;
  },
);
