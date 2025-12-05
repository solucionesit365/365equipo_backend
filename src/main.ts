import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";
import * as express from "express";

Settings.defaultZone = "Europe/Madrid";
var apm = require('elastic-apm-node').start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'api-365equipo',

  secretToken: '',

  serverUrl: 'http://158.158.16.178:8200',

  environment: process.env.NODE_ENV || 'development',
})

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
