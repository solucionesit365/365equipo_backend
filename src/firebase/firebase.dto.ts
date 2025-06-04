import { IsString } from "class-validator";

export class UpdateFirebaseDto {
  @IsString()
  email: string;

  @IsString()
  userId: string;
}
