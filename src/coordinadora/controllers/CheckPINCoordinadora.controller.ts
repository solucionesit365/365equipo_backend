import { Body, Controller, Get, Post } from "@nestjs/common";
import { ICheckPINCoordinadoraUseCase } from "../use-cases/interfaces/ICheckPINCoordinadora.use.case";
import { CheckPINCoordinadoraDto } from "./dto";

@Controller("check-pin-coordinadora")
export class CheckPINCoordinadoraController {
  constructor(
    private readonly checkPINCoordinadoraUseCase: ICheckPINCoordinadoraUseCase,
  ) {}

  @Post()
  checkPINCoordinadora(@Body() reqCheckPIN: CheckPINCoordinadoraDto) {
    return this.checkPINCoordinadoraUseCase.execute(
      reqCheckPIN.idTienda,
      reqCheckPIN.pin,
    );
  }

  @Get("detalle")
  getLastValidatedCoordinadora() {
    return this.checkPINCoordinadoraUseCase["lastCoordinadora"] ?? null;
  }
}
