import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/auth.guard";
import { DeleteTiendaMongoDto } from "./DeleteTiendaMongo.dto";
import { IDeleteTiendaMongoUseCase } from "./IDeleteTiendaMongo.use-case";

@Controller("delete-tienda-mongo")
export class DeleteTiendaMongoController {
  constructor(
    private readonly deleteTiendaMongoUseCase: IDeleteTiendaMongoUseCase,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async handle(@Body() req: DeleteTiendaMongoDto) {
    return this.deleteTiendaMongoUseCase.execute(req._id);
  }
}
