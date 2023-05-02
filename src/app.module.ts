import { Module, ValidationPipe } from "@nestjs/common";
// import { APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { AnunciosController } from "./anuncios/anuncios.controller";
import { TrabajadoresController } from "./trabajadores/trabajadores.controller";
import { TokenService } from "./get-token/get-token.service";
import { TiendasController } from "./tiendas/tiendas.controller";
import { VacacionesController } from "./vacaciones/vacaciones.controller";
import { TestController } from "./test/test.controller";
import { AnunciosService } from "./anuncios/anuncios.mongodb";
import { AnunciosClass } from "./anuncios/anuncios.class";
import { MongoDbService } from "./bbdd/mongodb";
import { CuadrantesController } from "./cuadrantes/cuadrantes.controller";
import { Cuadrantes } from "./cuadrantes/cuadrantes.class";
import { CuadrantesDatabase } from "./cuadrantes/cuadrantes.mongodb";
import { Tienda } from "./tiendas/tiendas.class";
import { FacTenaMssql } from "./bbdd/mssql.class";
import { FichajesController } from "./fichajes/fichajes.controller";
import { FichajesDatabase } from "./fichajes/fichajes.mongodb";
import { Fichajes } from "./fichajes/fichajes.class";
import { Trabajador } from "./trabajadores/trabajadores.class";
import { AusenciasController } from "./ausencias/ausencias.controller";
import { Ausencias } from "./ausencias/ausencias.class";
import { AusenciasDatabase } from "./ausencias/ausencias.mongodb";
import { AdminController } from "./admin/admin.controller";
import { Admin } from "./admin/admin.class";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    AnunciosController,
    TrabajadoresController,
    TiendasController,
    VacacionesController,
    TestController,
    CuadrantesController,
    FichajesController,
    AusenciasController,
    AdminController,
  ],
  providers: [
    AppService,
    TokenService,
    AnunciosService,
    AnunciosClass,
    MongoDbService,
    Cuadrantes,
    CuadrantesDatabase,
    Tienda,
    FacTenaMssql,
    FichajesDatabase,
    Fichajes,
    Trabajador,
    Ausencias,
    AusenciasDatabase,
    Admin,
  ],
})
export class AppModule {}
