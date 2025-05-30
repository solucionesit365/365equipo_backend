import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { CryptoModule } from "../crypto/crypto.module";
import { IStorageService } from "./storage.interface";

@Module({
  imports: [CryptoModule],
  providers: [{ provide: IStorageService, useClass: StorageService }],
  controllers: [StorageController],
  exports: [IStorageService],
})
export class StorageModule {}
