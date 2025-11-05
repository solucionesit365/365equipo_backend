import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/auth.guard";
import { CreateTiendaMongoDto } from "./CreateTiendaMongo.dto";
import { ICreateTiendaMongoUseCase } from "./ICreateTiendaMongo.use-case";

@Controller("create-tienda-mongo")
export class CreateTiendaMongoController {
  constructor(
    private readonly createTiendaMongoUseCase: ICreateTiendaMongoUseCase,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async handle(@Body() req: CreateTiendaMongoDto) {
    return this.createTiendaMongoUseCase.execute(req);
  }
}
