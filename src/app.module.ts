import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { ContratoModule } from "./contrato/contrato.module";
import { AdminModule } from "./admin/admin.module";
import { AnunciosModule } from "./anuncios/anuncios.module";
import { ArchivoDigitalModule } from "./archivo-digital/archivo-digital.module";
import { AuditoriasModule } from "./auditorias/auditorias.module";
import { AusenciasModule } from "./ausencias/ausencias.module";
import { CalendarioFestivosModule } from "./calendario-festivos/calendario-festivos.module";
import { ClientesModule } from "./clientes/clientes.module";
import { CryptoModule } from "./crypto/crypto.module";
import { CuadrantesModule } from "./cuadrantes/cuadrantes.module";
import { EmailModule } from "./email/email.module";
import { EvaluacionesModule } from "./evaluaciones/evaluaciones.module";
import { FichajesModule } from "./fichajes-bc/fichajes.module";
import { FichajesValidadosModule } from "./fichajes-validados/fichajes-validados.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { IncidenciasModule } from "./incidencias/incidencias.module";
import { MantenimientoModule } from "./mantenimiento/mantenimiento.module";
import { MigracionesModule } from "./migraciones/migraciones.module";
import { NominasModule } from "./nominas/nominas.module";
import { NotificacionesModule } from "./notificaciones/notificaciones.module";
import { PactadoVsRealModule } from "./pactado-vs-real/pactado-vs-real.module";
import { PermisosModule } from "./permisos/permisos.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SolicitudVacacionesModule } from "./solicitud-vacaciones/solicitud-vacaciones.module";
import { TarjetaClienteModule } from "./tarjeta-cliente/tarjeta-cliente.module";
import { TestModule } from "./test/test.module";
import { TiendasModule } from "./tiendas/tiendas.module";
import { TrabajadoresModule } from "./trabajadores/trabajadores.module";
import { VerificacionMfaModule } from "./verificacion-mfa/verificacion-mfa.module";
import { HitMssqlModule } from "./hit-mssql/hit-mssql.module";
import { MongoModule } from "./mongo/mongo.module";
import { Cultura365Module } from "./cultura365/cultura365.module";
import { MBCTokenModule } from "./bussinesCentral/services/mbctoken/mbctoken.service.module";
import { RoleModule } from "./role/role.module";
import { PermissionModule } from "./permission/permission.module";
import { EmpresaModule } from "./empresa/empresa.module";
import { KpiTiendasController } from "./kpi-tiendas/kpi-tiendas.controller";
import { KpiTiendasModule } from "./kpi-tiendas/kpi-tiendas.module";
import { DiaPersonalModule } from "./dia-personal/dia-personal.module";
import { DistribucionMensajesModule } from "./distribucion-mensajes/distribucion-mensajes.module";
import { VideosFormacionModule } from "./videos-formacion/videos-formacion.module";
import { NotasInformativasModule } from "./notas-informativas/notas-informativas.module";
import { BiometriaModule } from "./biometria/biometria.module";
import { EncargosModule } from "./encargos/encargos.module";
import { ColorSemanalModule } from "./color-semanal/color-semanal.module";
import { SanidadModule } from "./sanidad/sanidad.module";
import { HardwareModule } from "./hardware/hardware.module";
import { ChatModule } from "./chat/chat.module";
import { PerfilHardwareModule } from "./perfil-hardware/perfil-hardware.module";
import { TwilioModule } from "./twilio/twilio.module";
import { PdfModule } from "./pdf/pdf.module";
import { StorageModule } from "./storage/storage.module";
import { VideosModule } from "./videos/videos.module";
import { PresentationModule } from "./presentacion/presentation.module";
import { QuestionModule } from './question/question.module';
import { QuestionCategoryModule } from './question-category/question-category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ContratoModule,
    AdminModule,
    AnunciosModule,
    ArchivoDigitalModule,
    AuditoriasModule,
    AusenciasModule,
    CalendarioFestivosModule,
    ClientesModule,
    CryptoModule,
    CuadrantesModule,
    EmailModule,
    EvaluacionesModule,
    FichajesModule,
    FichajesValidadosModule,
    FirebaseModule,
    IncidenciasModule,
    MantenimientoModule,
    MigracionesModule,
    NominasModule,
    NotificacionesModule,
    PactadoVsRealModule,
    PermisosModule,
    PrismaModule,
    SolicitudVacacionesModule,
    TarjetaClienteModule,
    TestModule,
    TiendasModule,
    TrabajadoresModule,
    VerificacionMfaModule,
    HitMssqlModule,
    MongoModule,
    Cultura365Module,
    MBCTokenModule,
    RoleModule,
    PermissionModule,
    EmpresaModule,
    KpiTiendasModule,
    DiaPersonalModule,
    DistribucionMensajesModule,
    VideosFormacionModule,
    NotasInformativasModule,
    BiometriaModule,
    EncargosModule,
    ColorSemanalModule,
    SanidadModule,
    HardwareModule,
    ChatModule,
    PerfilHardwareModule,
    TwilioModule,
    PdfModule,
    StorageModule,
    VideosModule,
    PresentationModule,
    QuestionModule,
    QuestionCategoryModule,
  ],
  controllers: [AppController, KpiTiendasController],
})
export class AppModule {}
