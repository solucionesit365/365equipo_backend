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
import { NotificacionesModule } from "./notificaciones/notificaciones.module";
import { PactadoVsRealModule } from "./pactado-vs-real/pactado-vs-real.module";
import { PermisosModule } from "./permisos/permisos.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SolicitudVacacionesModule } from "./solicitud-vacaciones/solicitud-vacaciones.module";
import { TarjetaClienteModule } from "./tarjeta-cliente/tarjeta-cliente.module";
import { TestModule } from "./test/test.module";
import { TiendaModule } from "./tienda/tienda.module";
import { TrabajadorModule } from "./trabajador/trabajador.module";
import { VerificacionMfaModule } from "./verificacion-mfa/verificacion-mfa.module";
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
import { HardwareModule } from "./hardware/hardware.module";
import { ChatModule } from "./chat/chat.module";
import { PerfilHardwareModule } from "./perfil-hardware/perfil-hardware.module";
import { TwilioModule } from "./twilio/twilio.module";
import { PdfModule } from "./pdf/pdf.module";
import { StorageModule } from "./storage/storage.module";
import { VideosModule } from "./videos/videos.module";
import { PresentationModule } from "./presentacion/presentation.module";
import { QuestionModule } from "./question/question.module";
import { QuestionCategoryModule } from "./question-category/question-category.module";
import { FormacionModule } from "./formacion/formacion.module";
import { QuestionnaireModule } from "./questionnaire/questionnaire.module";
import { VisionModule } from "./vision/vision.module";
import { LoggerModule } from "./logger/logger.module";
import { NotificacionHorasExtrasModule } from "./notificacion-horas-extras/notificacion-horas-extras.module";
import { ParametrosModule } from "./parametros/parametros.module";
import { PowerAutomateModule } from "./power-automate/power-automate.module";
import { AxiosModule } from "./axios/axios.module";
import { NotificarAmpliacionContratosModule } from "./notificar-ampliacion-contratos/notificar-ampliacion-contratos.module";
import { GraphModule } from "./graph/graph.module";
import { TrabajadorDiaPersonalModule } from './trabajador-dia-personal/trabajador-dia-personal.module';
import { RegistroModule } from './registro/registro.module';
import { NotificacionModule } from './notificacion/notificacion.module';

@Module({
  imports: [
    // 1. Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Módulos de infraestructura base (sin dependencias entre ellos)
    PrismaModule,
    MongoModule,
    FirebaseModule,
    AxiosModule,

    // 3. Módulos de servicios compartidos (pueden depender de infraestructura)
    CryptoModule,
    EmailModule,
    StorageModule,
    TwilioModule,
    GraphModule,
    PowerAutomateModule,
    LoggerModule,

    // 4. Módulos de dominio base
    EmpresaModule,
    RoleModule,
    PermissionModule,
    PermisosModule,

    // 5. Módulos que dependen de servicios compartidos
    PdfModule, // Depende de CryptoModule, StorageModule, EmailModule
    VisionModule,

    // 6. Módulos de negocio
    AdminModule,
    TrabajadorModule,
    ClientesModule,
    ContratoModule,
    TiendaModule,

    // 7. Módulos de funcionalidades específicas
    AnunciosModule,
    ArchivoDigitalModule,
    AuditoriasModule,
    AusenciasModule,
    BiometriaModule,
    CalendarioFestivosModule,
    ChatModule,
    ColorSemanalModule,
    CuadrantesModule,
    Cultura365Module,
    DiaPersonalModule,
    DistribucionMensajesModule,
    EncargosModule,
    EvaluacionesModule,
    FichajesModule,
    FichajesValidadosModule,
    FormacionModule,
    HardwareModule,
    IncidenciasModule,
    KpiTiendasModule,
    MantenimientoModule,
    MigracionesModule,
    NotasInformativasModule,
    NotificacionHorasExtrasModule,
    NotificacionesModule,
    NotificarAmpliacionContratosModule,
    PactadoVsRealModule,
    ParametrosModule,
    PerfilHardwareModule,
    PresentationModule,
    QuestionModule,
    QuestionCategoryModule,
    QuestionnaireModule,
    SolicitudVacacionesModule,
    TarjetaClienteModule,
    VerificacionMfaModule,
    VideosModule,
    VideosFormacionModule,

    // 8. Módulos de utilidad/testing al final
    TestModule,
    MBCTokenModule,
    TrabajadorDiaPersonalModule,
    RegistroModule,
    NotificacionModule,
  ],
  controllers: [AppController, KpiTiendasController],
})
export class AppModule {
  constructor() {
    console.log("✓ AppModule constructor completed");
  }
}
