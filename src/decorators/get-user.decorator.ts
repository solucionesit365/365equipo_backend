import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserRecord } from "firebase-admin/auth";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserRecord => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new InternalServerErrorException("No se pudo obtener el usuario");
    }

    return request.user as UserRecord;
  },
);
