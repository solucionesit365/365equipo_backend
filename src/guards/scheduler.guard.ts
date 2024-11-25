import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class SchedulerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }

    if (authHeader !== "Bearer " + process.env.SINCRO_TOKEN) {
      throw new UnauthorizedException(
        "No tienes permiso para completar esta acción",
      );
    }

    return true;
  }
}
