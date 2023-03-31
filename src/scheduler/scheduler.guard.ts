import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";

@Injectable()
export class SchedulerGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }

    const token = this.tokenService.extract(authHeader);

    if (token !== process.env.SINCRO_TOKEN) {
      throw new UnauthorizedException(
        "No tienes permiso para completar esta acción",
      );
    }

    return true;
  }
}
