import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";

Settings.defaultZone = "Europe/Madrid";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: [
      "http://localhost:8080",
      "https://silema.web.app",
      "https://365equipo.com",
      "https://tarjeta-cliente.web.app",
      "https://demo.365equipo.com",
      "https://silema--test-271uc5ji.web.app",
    ],
  });

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("hbs");

  await app.listen(3000);
}

bootstrap();
