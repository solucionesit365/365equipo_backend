import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }
    const token = this.tokenService.extract(authHeader);

    try {
      await this.authInstance.verifyToken(token);
    } catch (err) {
      throw new UnauthorizedException("No estás autorizado/a");
    }
    return true;
  }
}
