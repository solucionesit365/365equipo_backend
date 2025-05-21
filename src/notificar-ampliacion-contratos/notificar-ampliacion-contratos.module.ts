import { Module } from "@nestjs/common";
import { NotificarAmpliacionContratosMongoService } from "./notificar-ampliacion-contratos.mongodb";
import { NotificarAmpliacionContratosController } from "./notificar-ampliacion-contratos.controller";
import { NotificarAmpliacionContratosClass } from "./notificar-ampliacion-contratos.class";
@Module({
  providers: [
    NotificarAmpliacionContratosMongoService,
    NotificarAmpliacionContratosClass,
  ],
  exports: [NotificarAmpliacionContratosClass],
  controllers: [NotificarAmpliacionContratosController],
})
export class NotificarAmpliacionContratosModule {}
