import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { CryptoModule } from "../crypto/crypto.module";
import { StorageModule } from "../storage/storage.module";
import { EmailModule } from "../email/email.module";
<<<<<<< Updated upstream
import { IPdfService } from "./pdf.interface";

@Module({
  imports: [CryptoModule, StorageModule, EmailModule],
  providers: [{ provide: IPdfService, useClass: PdfService }],
=======
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [CryptoModule, StorageModule, EmailModule, PrismaModule],
  providers: [PdfService],
>>>>>>> Stashed changes
  controllers: [PdfController],
})
export class PdfModule {}
