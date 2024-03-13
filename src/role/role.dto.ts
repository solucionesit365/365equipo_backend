import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class AddPermissionDto {
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @IsNotEmpty()
  @IsString()
  permissionId: string;
}

export class RemovePermissionDto {
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @IsNotEmpty()
  @IsString()
  permissionId: string;
}
