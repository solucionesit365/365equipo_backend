import { Controller, Get, Query } from "@nestjs/common";
import { db } from "../firebase/firestore";
import { getUserWithToken } from "../firebase/auth";

@Controller("anuncios")
export class AnunciosController {
  @Get("anuncios")
  async getAnuncios(@Query() { idTienda, token }) {
    try {
      if (idTienda && token) {
        const usuario = await getUserWithToken(token);
        const usersColection = db
          .collection("usuarios")
          .where("uid", "==", usuario.uid);
        const resultados = await usersColection.get();
        const userData = resultados.docs[0].data();

        if (userData.tiendas.includes(usuario.idTienda)) {
          const resultadosAnuncios = await db
            .collection("anuncios")
            .where("tienda", "==", "Todas")
            .get();
          const resultadosAnuncios2 = await db
            .collection("anuncios")
            .where("tienda", "array-contains", usuario.idTienda)
            .get();
          let devolver: any = [];
          const aux1: any = [];
          const aux2: any = [];

          resultadosAnuncios.forEach((item) => {
            aux1.push({ id: item.id, ...item.data() });
          });

          resultadosAnuncios2.forEach((item) => {
            aux2.push({ id: item.id, ...item.data() });
          });

          devolver = aux1.concat(aux2);

          return devolver;
        } else {
          const resultadosAnuncios = await db
            .collection("anuncios")
            .where("tienda", "==", "Todas")
            .get();
          const devolver: any = [];

          resultadosAnuncios.forEach((item) => {
            devolver.push({ id: item.id, ...item.data() });
          });

          return devolver;
        }
      }
      throw Error("Faltan parámetros");
    } catch (err) {
      console.log(err);
      return { error: true, message: err.message };
    }
  }
}
