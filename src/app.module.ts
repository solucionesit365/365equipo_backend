import { Module, ValidationPipe } from "@nestjs/common";
// import { APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { AnunciosController } from "./anuncios/anuncios.controller";
import { TrabajadoresController } from "./trabajadores/trabajadores.controller";
import { TokenService } from "./get-token/get-token.service";
import { TiendasController } from "./tiendas/tiendas.controller";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    AppController,
    AnunciosController,
    TrabajadoresController,
    TiendasController,
  ],
  providers: [AppService, TokenService],
})
export class AppModule {}
