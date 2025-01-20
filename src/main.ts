import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

Settings.defaultZone = "Europe/Madrid";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const arrayCors: string[] = [
    "https://silema.web.app",
    "https://365equipo.com",
    "https://club365obrador.web.app",
    "https://tarjeta-cliente.web.app",
    "https://demo.365equipo.com",
  ];

  if (process.env.ENTORNO) {
    arrayCors.push("http://localhost:8080");
  }

  app.enableCors({
    origin: arrayCors,
  });

  const config = new DocumentBuilder()
    .setTitle("Documentación App 365 Empleados")
    .setVersion("1.0")
    .addTag("empleados")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, documentFactory);

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("hbs");

  // Configurar los límites del cuerpo aquí
  app.useBodyParser("json", { limit: "50mb" });
  app.useBodyParser("urlencoded", { limit: "50mb", extended: true });

  await app.listen(3000);
}

bootstrap();
