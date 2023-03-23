import { ObjectId } from "mongodb";

export interface Anuncios {
    _id: ObjectId,
    tiendas: number[];
    
}