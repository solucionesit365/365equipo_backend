import { Module } from "@nestjs/common";
import { NotificarAmpliacionContratosMongoService } from "./notificar-ampliacion-contratos.mongodb";
import { NotificarAmpliacionContratosController } from "./notificar-ampliacion-contratos.controller";
import { NotificarAmpliacionContratosClass } from "./notificar-ampliacion-contratos.class";
import { MongoModule } from "../mongo/mongo.module";
@Module({
  imports: [MongoModule],
  providers: [
    NotificarAmpliacionContratosMongoService,
    NotificarAmpliacionContratosClass,
  ],
  exports: [NotificarAmpliacionContratosClass],
  controllers: [NotificarAmpliacionContratosController],
})
export class NotificarAmpliacionContratosModule {}
