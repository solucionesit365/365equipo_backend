import { Controller, Post } from "@nestjs/common";
import { ISincroTrabajadoresUseCase } from "./ISincroTrabajadores.use-case";

@Controller("sincro-trabajadores")
export class SincroTrabajadoresController {
  constructor(
    private readonly sincroTrabajadores: ISincroTrabajadoresUseCase,
  ) {}

  @Post()
  sincroConOmne() {
    return this.sincroTrabajadores.execute();
  }
}
