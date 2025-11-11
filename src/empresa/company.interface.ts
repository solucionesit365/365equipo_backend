import { ObjectId } from "mongodb";

export abstract class CompanyInterface {
  id: ObjectId;
  idExterno?: number;
  nombre: string;
  cif: string;
  autogestionada: boolean;
  existsBC: boolean;
}

export abstract class CompanyCreate {
  idExterno?: number;
  nombre: string;
  cif: string;
  autogestionadaa?: boolean;
  existsBC?: boolean;
}

export abstract class CompanyUpdate {
  idExterno?: number;
  nombre?: string;
  cif?: string;
  autogestionada?: boolean;
  existsBC?: boolean;
}

export abstract class CompanyDelete {
  id: ObjectId;
}
