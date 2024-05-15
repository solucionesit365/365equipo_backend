import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

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
      const userInfo = await this.firebaseService.verifyToken(tokenLimpio);
      const usuarioCompleto = await this.firebaseService.auth.getUser(
        userInfo.uid,
      );
      request.user = usuarioCompleto;
    } catch (err) {
      // console.log(err);
      throw new UnauthorizedException("No estás autorizado/a");
    }
    return true;
  }
}
