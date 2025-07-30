import { Trabajador } from "@prisma/client";

export interface IUpdateTrabajadorOrganizacionDto {
  id: number;
  arrayRoles?: string[];
  arrayPermisos?: string[];
  idResponsable?: number;
  idTienda?: number;
  llevaEquipo?: boolean;
  empresaId?: string;
  tipoTrabajador?: string;
}

export abstract class IUpdateTrabajadorOrganizacionUseCase {
  abstract execute(trabajador: IUpdateTrabajadorOrganizacionDto): Promise<Trabajador>;
}