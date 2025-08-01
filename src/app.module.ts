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
import { TiendasModule } from "./tiendas/tiendas.module";
import { TrabajadoresModule } from "./trabajadores/trabajadores.module";
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
import { TurnoModule } from "./turno/turno.module";
import { CoordinadoraModule } from "./coordinadora/coordinadora.module";
import { PlantillaTurnoModule } from "./plantilla-turno/plantilla-turno.module";
import { MacroModule } from "./macro/macro.module";
import { AusenciaModule } from "./ausencia/ausencia.module";
import { FaqModule } from "./faq/faq.module";
import { SupervisorTiendaModule } from "./supervisor-tienda/supervisor-tienda.module";
import { SubordinadoModule } from './subordinado/subordinado.module';

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
    HardwareModule,
    ChatModule,
    PerfilHardwareModule,
    TwilioModule,
    PdfModule,
    StorageModule,
    GraphModule,
    VideosModule,
    PresentationModule,
    QuestionModule,
    QuestionCategoryModule,
    FormacionModule,
    QuestionnaireModule,
    VisionModule,
    LoggerModule,
    NotificacionHorasExtrasModule,
    ParametrosModule,
    PowerAutomateModule,
    AxiosModule,
    NotificarAmpliacionContratosModule,
    TurnoModule,
    CoordinadoraModule,
    PlantillaTurnoModule,
    MacroModule,
    AusenciaModule,
    FaqModule,
    SupervisorTiendaModule,
    SubordinadoModule,
  ],
  controllers: [AppController, KpiTiendasController],
})
export class AppModule {}
