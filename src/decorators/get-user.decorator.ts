import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { DecodedIdToken } from "firebase-admin/auth";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new InternalServerErrorException("No se pudo obtener el usuario");
    }

    return request.user as DecodedIdToken;
  },
);
