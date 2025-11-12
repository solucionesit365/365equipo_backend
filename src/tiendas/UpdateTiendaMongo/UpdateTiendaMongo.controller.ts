import { Body, Controller, Post } from "@nestjs/common";
import { IUpdateTiendaMongoUseCase } from "./IUpdateTiendaMongo.use-case";
import { UpdateTiendaMongoDto } from "./UpdateTiendaMongo.dto";

@Controller("update-tienda-mongo")
export class UpdateTiendaMongoController {
  constructor(
    private readonly updateTiendaMongoUseCase: IUpdateTiendaMongoUseCase,
  ) {}

  @Post()
  handle(@Body() req: UpdateTiendaMongoDto) {
    const { _id, ...reqPayload } = req;
    return this.updateTiendaMongoUseCase.execute(_id, reqPayload);
  }
}
