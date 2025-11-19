import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VideoStreamAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];
    const tokenQuery = request.query.token;

    // Permitir token tanto en header como en query parameter
    let token: string | null = null;

    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    } else if (tokenQuery) {
      token = tokenQuery;
    }

    if (!token) {
      throw new UnauthorizedException(
        "No se proporcionó el token de autorización",
      );
    }

    try {
      const userInfo = await this.firebaseService.verifyToken(token);
      const usuarioCompleto = await this.firebaseService.auth.getUser(
        userInfo.uid,
      );
      request.sqlUser = await this.prismaService.trabajador.findFirstOrThrow({
        where: {
          idApp: userInfo.uid,
        },
        include: {
          roles: true,
          permisos: true,
        },
      });
      request.user = usuarioCompleto;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException("No estás autorizado/a");
    }
    return true;
  }
}
