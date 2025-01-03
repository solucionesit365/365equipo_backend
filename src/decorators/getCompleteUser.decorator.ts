import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { Trabajador } from "@prisma/client";

export const CompleteUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Trabajador => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.sqlUser) {
      throw new InternalServerErrorException("No se pudo obtener el usuario");
    }

    return request.sqlUser as Trabajador;
  },
);
