import { Module } from "@nestjs/common";
import { CoordinadoraRepositoryService } from "./coordinadora.repository.service";
import { CoordinadoraDatabaseService } from "./coordinadora.database";

@Module({
  providers: [CoordinadoraRepositoryService, CoordinadoraDatabaseService],
  exports: [CoordinadoraRepositoryService],
})
export class CoordinadoraModule {}
