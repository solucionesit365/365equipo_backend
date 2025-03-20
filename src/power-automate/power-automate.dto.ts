import { IsString } from "class-validator";

export class TestDto {
  @IsString()
  taskId: string;

  @IsString()
  email: string;
}
