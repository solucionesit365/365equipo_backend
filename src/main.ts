import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Settings } from "luxon";
import * as express from "express";

Settings.defaultZone = "Europe/Madrid";
async function bootstrap() {
  try {
    console.log("🚀 Starting bootstrap...");

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
    });

    console.log("✓ App created");

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    console.log("✓ Global pipes set");

    app.enableCors({
      origin: "*",
    });
    console.log("✓ CORS enabled");

    app.useStaticAssets(join(__dirname, "..", "public"));
    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("hbs");
    console.log("✓ View engine configured");

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    console.log("✓ Body parsers configured");

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "0.0.0.0";

    console.log(`📡 Attempting to listen on ${host}:${port}...`);

    await app.listen(port, host);

    console.log(`✅ Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error("❌ Error during bootstrap:", error);
    throw error;
  }
}

bootstrap().catch((err) => {
  console.error("❌ Error starting the application:", err);
  process.exit(1);
});
