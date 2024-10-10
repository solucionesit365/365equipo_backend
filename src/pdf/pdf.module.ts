import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { CryptoModule } from "../crypto/crypto.module";

@Module({
  imports: [CryptoModule],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}
