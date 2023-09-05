import { Controller } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { solicitudesVacacionesClass } from "./solicitud-vacaciones.class";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";

@Controller("solicitud-vacaciones")
export class SolicitudVacacionesController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly solicitudVacacionesInstance: solicitudesVacacionesClass,
  ) {}

  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    const insertSolicitudVacaciones =
      await this.solicitudVacacionesInstance.nuevaSolicitudVacaciones(
        solicitudVacaciones,
      );
    if (insertSolicitudVacaciones) return true;

    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }
}
