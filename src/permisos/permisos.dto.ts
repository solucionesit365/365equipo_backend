import { IsNotEmpty, IsString } from "class-validator";

export class GetCustomClaimsRequestDto {
  @IsNotEmpty()
  @IsString()
  idApp: string;
}
