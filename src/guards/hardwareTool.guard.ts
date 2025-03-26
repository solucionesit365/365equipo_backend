import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class HardwareToolGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }

    if (authHeader !== "Bearer " + process.env.HARDWARE_TOOL_TOKEN) {
      throw new UnauthorizedException(
        "No tienes permiso para completar esta acción",
      );
    }

    return true;
  }
}
