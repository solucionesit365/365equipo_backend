import { Module } from "@nestjs/common";
import { BiometriaController } from "./biometria.controller";
import { BiometriaService } from "./biometria.service";
import { BiometriaDatabase } from "./biometria.mongodb";

@Module({
  controllers: [BiometriaController],
  providers: [BiometriaService, BiometriaDatabase],
})
export class BiometriaModule {}
