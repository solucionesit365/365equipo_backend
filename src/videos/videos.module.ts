import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { StorageModule } from "../storage/storage.module";
import { CryptoModule } from "../crypto/crypto.module";

@Module({
  imports: [StorageModule, CryptoModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
