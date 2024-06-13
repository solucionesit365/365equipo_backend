import { Module } from "@nestjs/common";
import { DistribucionMensajesClass } from "./distribucion-mensajes.class";
import { DistribucionMensajesController } from "./distribucion-mensajes.controller";
import { DistribucionMensajesDatabase } from "./distribucion-mensajes.mongodb";

@Module({
  providers: [DistribucionMensajesClass, DistribucionMensajesDatabase],
  controllers: [DistribucionMensajesController],
})
export class DistribucionMensajesModule {}
