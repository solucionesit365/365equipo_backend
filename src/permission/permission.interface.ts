import { CreatePermissionDto } from "./permission.dto";

export abstract class IPermissionService {
  abstract createPermission(permission: CreatePermissionDto): Promise<{
    name: string;
    id: string;
  }>;

  abstract getPermissions(): Promise<
    {
      name: string;
      id: string;
    }[]
  >;
  abstract getPermissionById(id: string): Promise<{
    name: string;
    id: string;
  }>;
  abstract deletePermission(id: string): Promise<{
    name: string;
    id: string;
  }>;
}
