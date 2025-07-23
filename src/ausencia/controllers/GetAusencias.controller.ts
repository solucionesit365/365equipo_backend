import { Controller, Get, Query } from "@nestjs/common";
import { GetAusenciasDto } from "./dto/GetAusenciasDto";
import { IGetAusenciasUseCase } from "../interfaces/IGetAusencias.use-case";

@Controller("get-ausencias")
export class GetAusenciasController {
  constructor(private readonly getAusenciasUseCase: IGetAusenciasUseCase) {}

  @Get()
  getAusencia(@Query() reqGetAusencia: GetAusenciasDto) {
    return this.getAusenciasUseCase.execute(reqGetAusencia.year);
  }
}
