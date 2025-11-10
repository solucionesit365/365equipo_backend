import { IsNotEmpty, IsString } from "class-validator";

export class CreateVideoSupportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
