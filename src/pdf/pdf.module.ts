import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { CryptoModule } from "../crypto/crypto.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [CryptoModule, StorageModule],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}
