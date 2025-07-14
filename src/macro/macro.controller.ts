import { Controller, Get, Post } from "@nestjs/common";
import { MacroService } from "./macro.service";

@Controller("macro")
export class MacroController {
  constructor(private readonly macroService: MacroService) {}
  @Get("corregir-coordinadoras")
  corregirCoordinadoras() {
    return this.macroService.corregirCoordinadoras();
  }
}
