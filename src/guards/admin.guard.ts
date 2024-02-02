import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authInstance: FirebaseService) {}

  pasoPermitidoByClaims(arrayPermisos: any[], cualquieraDe: any[]) {
    if (arrayPermisos) {
      for (let i = 0; i < arrayPermisos.length; i++) {
        for (let j = 0; j < cualquieraDe.length; j++) {
          if (
            arrayPermisos[i] === cualquieraDe[j] ||
            arrayPermisos[i] === "SUPER_ADMIN"
          )
            return true;
        }
      }
    }

    return false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }
    const tokenLimpio = authHeader.replace("Bearer ", "");

    try {
      await this.authInstance.verifyToken(tokenLimpio);
      const usuario = await this.authInstance.getUserWithToken(tokenLimpio);
      const cualquieraDe = ["RRHH_ADMIN"];

      if (
        this.pasoPermitidoByClaims(
          usuario.customClaims?.arrayPermisos,
          cualquieraDe,
        )
      )
        return true;
      throw Error("No estás autorizado/a");
    } catch (err) {
      throw new UnauthorizedException("No estás autorizado/a");
    }
    return true;
  }
}
