import { DeleteResult, InsertOneResult, ObjectId } from "mongodb";
import { Tiendas2 } from "../tiendas.dto";
import { IUpdateTiendaMongo } from "../UpdateTiendaMongo/IUpdateTiendaMongo.use-case";

export interface ICreateTiendaMongo {
  // Esto debería estar en la interface del use case, no en el repo
  address: string;
  postalCode: string;
  city: string;
  province: string;
  municipalityCode: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  id: number;
  idExterno: number;
  phone: string;
}

export interface ITiendaMongo {
  _id: ObjectId;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  municipalityCode: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  id: number;
  idExterno: number;
  phone: string;
}

export abstract class ITiendaMongoRepository {
  abstract getTiendasAtenea(): Promise<Tiendas2[]>;
  abstract createTienda(
    payload: ICreateTiendaMongo,
  ): Promise<InsertOneResult<ICreateTiendaMongo>>;
  abstract update(id: ObjectId, payload: IUpdateTiendaMongo): Promise<void>;
  abstract delete(id: ObjectId): Promise<DeleteResult>;
}
