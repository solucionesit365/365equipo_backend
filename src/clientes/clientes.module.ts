import { Module } from "@nestjs/common";
import { ClientesService } from "./clientes.service";
import { SolicitudNuevoClienteBbdd } from "./clientes.mongodb";
import { EmailModule } from "../email/email.module";
import { TarjetaClienteModule } from "../tarjeta-cliente/tarjeta-cliente.module";
import { MailchimpModule } from "../mailchimp/mailchimp.module";
import { ClientesController } from "./clientes.controller";

@Module({
  imports: [EmailModule, TarjetaClienteModule, MailchimpModule],
  providers: [ClientesService, SolicitudNuevoClienteBbdd],
  exports: [ClientesService],
  controllers: [ClientesController],
})
export class ClientesModule {}
