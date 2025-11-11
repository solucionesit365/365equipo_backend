export abstract class CompanyInterface {
  id: string;
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
  autogestionada?: boolean;
  existsBC?: boolean;
}

export abstract class CompanyUpdate {
  idExterno?: number;
  nombre?: string;
  cif?: string;
  autogestionada?: boolean;
  existsBC?: boolean;
}
