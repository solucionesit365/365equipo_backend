import { Module } from "@nestjs/common";
import { AnunciosService } from "./anuncios.class";
import { AnunciosDatabaseService } from "./anuncios.mongodb";

@Module({
  providers: [AnunciosService, AnunciosDatabaseService],
  exports: [AnunciosService],
})
export class AnunciosModule {}
