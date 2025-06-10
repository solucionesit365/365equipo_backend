import { Module } from "@nestjs/common";
import { ContactoController } from "./contacto.controller";

@Module({
  controllers: [ContactoController],
})
export class ContactoModule {}
