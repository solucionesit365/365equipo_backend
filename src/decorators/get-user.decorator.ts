import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { DecodedIdToken } from "firebase-admin/auth";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException("You are not authorized");
    }

    return request.user as DecodedIdToken;
  },
);
