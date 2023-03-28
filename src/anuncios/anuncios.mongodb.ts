// import { conexion } from "../bbdd/mongodb";
// import { AnuncioDto } from "./anuncios.dto";

// export async function getAnuncios(tiendas: number[]) {
//   const db = (await conexion).db("soluciones");
//   const anuncios = db.collection<AnuncioDto>("anuncios");
//   if (tiendas.includes(-1)) {
//     return await anuncios.find().toArray();
//   }
//   return await anuncios.find({ tiendas: { $all: tiendas } }).toArray();
// }

// export async function addAnuncio(anuncio: AnuncioDto) {
//   const db = (await conexion).db("soluciones");
//   const anuncios = db.collection<AnuncioDto>("anuncios");

//   const resInsert = await anuncios.insertOne(anuncio);

//   if (resInsert.acknowledged) return resInsert.insertedId;
//   return null;
// }
