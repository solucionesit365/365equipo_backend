import { IsNumber } from "class-validator";

export class UpdateSupervisoraTiendaDto {
  @IsNumber({}, { each: true })
  tiendasIds: number[];
  @IsNumber()
  idSupervisora: number;
}
