import { Module } from "@nestjs/common";
// import { APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { AnunciosController } from "./anuncios/anuncios.controller";
import { TrabajadoresController } from "./trabajadores/trabajadores.controller";
import { TokenService } from "./get-token/get-token.service";
import { TiendasController } from "./tiendas/tiendas.controller";
import { VacacionesController } from "./vacaciones/vacaciones.controller";
import { Vacaciones } from "./vacaciones/vacaciones.class";
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
import { FirebaseMessagingService } from "./firebase/firebase-messaging.service";
import { NotificacionesController } from "./notificaciones/notificaciones.controller";
import { Notificaciones } from "./notificaciones/notificaciones.class";
import { NotificacionsBbdd } from "./notificaciones/notificaciones.mongodb";
import { NominasController } from "./nominas/nominas.controller";
import { Nominas } from "./nominas/nominas.class";
import { NominasDatabase } from "./nominas/nominas.database";
import { AdminController } from "./admin/admin.controller";
import { Admin } from "./admin/admin.class";
import { FichajesValidadosController } from "./fichajes-validados/fichajes-validados.controller";
import { FichajesValidados } from "./fichajes-validados/fichajes-validados.class";
import { FichajesValidadosDatabase } from "./fichajes-validados/fichajes-validados.mongodb";
import { EmailClass } from "./email/email.class";
import { AuthService } from "./firebase/auth";
import { PermisosController } from "./permisos/permisos.controller";
import { PermisosClass } from "./permisos/permisos.class";
import { TarjetaCliente } from "./tarjeta-cliente/tarjeta-cliente.class";
import { CryptoController } from "./crypto/crypto.controller";
import { CryptoClass } from "./crypto/crypto.class";
import { ClientesService } from "./clientes/clientes.service";
import { ClientesController } from "./clientes/clientes.controller";
import { SolicitudNuevoClienteBbdd } from "./clientes/clientes.mongodb";
import { IncidenciasController } from "./incidencias/incidencias.controller";
import { IncidenciasClass } from "./incidencias/incidencias.mongodb";
import { Incidencia } from "./incidencias/incidencias.class";
import { VerificacionmfaController } from "./verificacionMFA/verificacionmfa.controller";
import { VerifiacacionDatabase } from "./verificacionMFA/verificacionmfa.mongodb";
import { VerificacionClass } from "./verificacionMFA/verificacionmfa.class";
import { AuditoriasController } from "./auditorias/auditorias.controller";
import { AuditoriaDatabase } from "./auditorias/auditorias.mongodb";
import { Auditorias } from "./auditorias/auditorias.class";
import { CalendarioFestivosController } from "./calendario-festivos/calendario-festivos.controller";
import { CalendarioFestivo } from "./calendario-festivos/calendario-festivos.class";
import { CalendarioFestivosDatabase } from "./calendario-festivos/calendario-festivos.mongodb";
import { ArchivoDigitalController } from "./archivo-digital/archivo-digital.controller";
import { ArchivoDigital } from "./archivo-digital/archivo-digital.class";
import { ArchivoDigitalDatabase } from "./archivo-digital/archivo-digital.mongodb";
import { SolicitudVacacionesController } from "./solicitud-vacaciones/solicitud-vacaciones.controller";
import { solicitudesVacacionesClass } from "./solicitud-vacaciones/solicitud-vacaciones.class";
import { SolicitudVacacionesBdd } from "./solicitud-vacaciones/solicitud-vacaciones.mongodb";
import { EvaluacionesController } from "./evaluaciones/evaluaciones.controller";
import { EvaluacionesDatabase } from "./evaluaciones/evaluaciones.mongodb";
import { EvaluacionesClass } from "./evaluaciones/evaluaciones.class";
import { MantenimientoController } from "./mantenimiento/mantenimiento.controller";
import { PactadoVsRealController } from "./pactado-vs-real/pactado-vs-real.controller";
import { PactadoVsRealService } from "./pactado-vs-real/pactado-vs-real.service";
// import { PrismaService } from './prisma/prisma.service';
import { MbctokenService } from "./bussinesCentral/services/mbctoken/mbctoken.service";
import { EmployeesClass } from "./bussinesCentral/employees/employees.class";
import { EmployeesController } from "./bussinesCentral/employees/employees.controller";
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
    NominasController,
    AdminController,
    NotificacionesController,
    FichajesValidadosController,
    PermisosController,
    CryptoController,
    ClientesController,
    IncidenciasController,
    AuditoriasController,
    VerificacionmfaController,
    CalendarioFestivosController,
    ArchivoDigitalController,
    SolicitudVacacionesController,
    EvaluacionesController,
    MantenimientoController,
    PactadoVsRealController,
    EmployeesController,
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
    EmailClass,
    Trabajador,
    Ausencias,
    AusenciasDatabase,
    Vacaciones,
    FirebaseMessagingService,
    Notificaciones,
    NotificacionsBbdd,
    Nominas,
    NominasDatabase,
    FichajesValidados,
    Admin,
    FichajesValidadosDatabase,
    AuthService,
    PermisosClass,
    TarjetaCliente,
    CryptoClass,
    ClientesService,
    SolicitudNuevoClienteBbdd,
    IncidenciasClass,
    Incidencia,
    AuditoriaDatabase,
    Auditorias,
    VerifiacacionDatabase,
    VerificacionClass,
    CalendarioFestivosDatabase,
    CalendarioFestivo,
    ArchivoDigital,
    ArchivoDigitalDatabase,
    solicitudesVacacionesClass,
    SolicitudVacacionesBdd,
    EvaluacionesDatabase,
    EvaluacionesClass,
    PactadoVsRealService,
    // PrismaService,
    MbctokenService,
    EmployeesClass,
  ],
})
export class AppModule {}
