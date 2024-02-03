import { Module } from "@nestjs/common";
import { TarjetaClienteService } from "./tarjeta-cliente.class";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  providers: [TarjetaClienteService],
  exports: [TarjetaClienteService],
})
export class TarjetaClienteModule {}
