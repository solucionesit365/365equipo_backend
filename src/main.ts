import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      "http://localhost:8080",
      "https://silema.web.app",
      "https://365equipo.com",
    ],
  });
  await app.listen(3000);
}
bootstrap();
