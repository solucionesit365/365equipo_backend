import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class PermisosService {
  constructor(
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
  ) {}

  /* Eliminar esta función y dejar solo la del AdminGuard */
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

  async setCustomClaims(
    claimsGestor: any,
    uidUsuarioDestino: string,
    payload: any[],
  ) {
    const cualquieraDe = ["SUPER_ADMIN", "RRHH_ADMIN"];

    if (this.pasoPermitidoByClaims(claimsGestor?.arrayPermisos, cualquieraDe)) {
      if (payload?.length === 1 && payload[0] === "") payload = [];

      await this.firebaseService.auth.setCustomUserClaims(uidUsuarioDestino, {
        arrayPermisos: payload,
      });
      return true;
    } else throw Error("No tienes permiso para realizar esta acción");
  }

  async getCustomClaims(claimsGestor: any, uidModificado: string) {
    const cualquieraDe = ["SUPER_ADMIN", "RRHH_ADMIN"];

    if (this.pasoPermitidoByClaims(claimsGestor?.arrayPermisos, cualquieraDe)) {
      const usuarioModificado = await this.firebaseService.getUserByUid(
        uidModificado,
      );
      return usuarioModificado.customClaims;
    } else throw Error("No tienes permiso para realizar esta acción");
  }
}
