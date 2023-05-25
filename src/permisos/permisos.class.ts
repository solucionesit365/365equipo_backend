import { Injectable } from "@nestjs/common";
import { auth } from "../firebase/auth";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";

@Injectable()
export class PermisosClass {
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

      await auth.setCustomUserClaims(uidUsuarioDestino, {
        arrayPermisos: payload,
      });
      return true;
    } else throw Error("No tienes permiso para realizar esta acción");
  }
}
