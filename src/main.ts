// Inicializar APM ANTES de cualquier otro import para asegurar instrumentación correcta
var apm = require('elastic-apm-node').start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || '365equipo-backend',
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || '',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://158.158.16.178:8200',
  environment: process.env.ELASTIC_APM_ENVIRONMENT || 'local',
  // Configuración para capturar todas las transacciones
  transactionSampleRate: 1.0, // Capturar 100% de las transacciones (ajustable según necesidades)
  captureBody: 'transactions', // Capturar bodies de transacciones
  captureHeaders: true, // Capturar headers
  // Asegurar captura de transacciones HTTP entrantes y salientes
  captureExceptions: true,
  logLevel: process.env.ELASTIC_APM_LOG_LEVEL || 'info',
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";
import * as express from "express";

Settings.defaultZone = "Europe/Madrid";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(apm.middleware.connect());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: "*",
  });

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("hbs");
  app.use(express.json({ limit: "1gb" }));
  app.use(express.urlencoded({ limit: "1gb", extended: true }));

  // Usar variables de entorno o valores por defecto
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || "0.0.0.0";

  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error("Error starting the application:", err);
  process.exit(1);
});
