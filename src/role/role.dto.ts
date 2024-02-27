import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  permissionsIds: string[];
}
