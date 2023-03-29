import { getAuth, UserRecord } from "firebase-admin/auth";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";
import { recSoluciones } from "../bbdd/mssql";
import { app } from "./app";
import { trabajadorInstance } from "../trabajadores/trabajadores.class";

export const auth = getAuth(app);

export async function verifyToken(token: string) {
  await auth.verifyIdToken(token, true);
}

export async function getUserWithToken(
  token: string,
): Promise<TrabajadorCompleto> {
  const decodedIdToken = await auth.verifyIdToken(token, true);
  const user: Omit<UserRecord, "toJSON"> = await auth.getUser(
    decodedIdToken.uid,
  );

  if (user) {
    const resUser = await trabajadorInstance.getTrabajadorByAppId(user.uid);

    return { ...user, ...resUser };

    // await recSoluciones(
    //   "soluciones",
    //   `
    //   SELECT * FROM trabajadores WHERE idApp = @param0`,
    //   user.uid,
    // );

    // if (resUser.recordset?.length > 0) {
    //   return { ...user, ...resUser.recordset[0] };
    // }
    // throw Error("Usuario no encontrado en SQL");
  }

  throw Error("No se ha podido obtener el usuario");
}
