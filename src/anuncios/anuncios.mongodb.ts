import { conexion } from "../bbdd/mongodb";

export async function getAnuncios(idTienda: number) {
    const db = (await conexion).db("soluciones");
    const anuncios = db.collection("anuncios");
}