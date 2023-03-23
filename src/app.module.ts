import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AnunciosController } from "./anuncios/anuncios.controller";
import { TrabajadoresController } from './trabajadores/trabajadores.controller';

@Module({
  imports: [],
  controllers: [AppController, AnunciosController, TrabajadoresController],
  providers: [AppService],
})
export class AppModule {}
