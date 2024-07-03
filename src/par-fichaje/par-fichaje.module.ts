import { Module } from "@nestjs/common";
import { ParFichajeController } from "./par-fichaje.controller";
import { ParFichajeService } from "./par-fichaje.service";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TrabajadoresModule],
  controllers: [ParFichajeController],
  providers: [ParFichajeService],
})
export class ParFichajeModule {}
