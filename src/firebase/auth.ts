import { getAuth } from "firebase-admin/auth";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";
import { recSoluciones } from "../bbdd/mssql";
import { app } from "./app";

export const auth = getAuth(app);

export async function getUserWithToken(
  token: string,
): Promise<TrabajadorCompleto> {
  const decodedIdToken = await auth.verifyIdToken(token, true);
  const user = await auth.getUser(decodedIdToken.uid);

  if (user) {
    const resUser = await recSoluciones(
      "soluciones",
      `
      SELECT * FROM trabajadores WHERE idApp = '${user.uid}'`,
    );

    if (resUser.recordset?.length > 0) {
      return { ...user, ...resUser.recordset[0] };
    }
    throw Error("Usuario no encontrado en SQL");
  }

  throw Error("No se ha podido obtener el usuario");
}
