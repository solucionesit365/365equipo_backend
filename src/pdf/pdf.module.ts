import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { CryptoModule } from "../crypto/crypto.module";
import { StorageModule } from "../storage/storage.module";
import { EmailModule } from "../email/email.module";
import { IPdfService } from "./pdf.interface";

@Module({
  imports: [CryptoModule, StorageModule, EmailModule],
  providers: [{ provide: IPdfService, useClass: PdfService }],
  controllers: [PdfController],
})
export class PdfModule {}
