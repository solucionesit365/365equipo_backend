import { IsString } from "class-validator";

export class DeleteTiendaMongoDto {
  @IsString()
  _id: string;
}
