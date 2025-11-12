export interface IUpdateTiendaMongo {
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  municipalityCode?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  id?: number;
  idExterno?: number;
  phone?: string;
}

export abstract class IUpdateTiendaMongoUseCase {
  abstract execute(id: string, payload: IUpdateTiendaMongo): Promise<void>;
}
