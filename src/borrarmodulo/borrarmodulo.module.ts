import { Module } from "@nestjs/common";
import { BorrarmoduloService } from "./borrarmodulo.service";

@Module({
  providers: [BorrarmoduloService],
})
export class BorrarmoduloModule {}
