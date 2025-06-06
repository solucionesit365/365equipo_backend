import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";
import * as express from "express";

Settings.defaultZone = "Europe/Madrid";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: "*",
    // origin: [
    //   "http://localhost:8080",
    //   "https://silema.web.app",
    //   "https://365equipo.com",
    //   "https://club365obrador.web.app",
    //   "https://silema--test-08eqf71j.web.app",
    //   "https://tarjeta-cliente.web.app",
    //   "https://demo.365equipo.com",
    //   "https://silema--test-271uc5ji.web.app",
    // ],
  });

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("hbs");
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
